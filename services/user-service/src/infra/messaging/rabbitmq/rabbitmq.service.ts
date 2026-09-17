import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as amqp from 'amqplib'
import { Env } from "../../../env/env";
import { once } from "node:events";

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {

  private readonly logger = new Logger(RabbitmqService.name)
  private connection!: amqp.ChannelModel
  private channel!: amqp.ConfirmChannel

  constructor(private configService: ConfigService<Env, true>) {}

  async onModuleInit() {
    await this.connect()
  }

  async onModuleDestroy() {
    await this.disconnect()
  }


  // Em sistemas distribuidos, a confirmação que o serviço de mensageria esteja funcionando 
  // é essencial para evitar erros críticos no sistema, como perda de mensagens e inconsistencias.
  // Por isso, nesse metodo, é utilizado o retry com backoff exponencial; 
  // se apos as retentativas o rabbitmq n conectar, será lançada uma excessão impedindo a inicialização do sistema.
  private async connect() {
    const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL')
    const maxAttempts = 5
    const baseDelay = 2000
    const maxDelay = 30000 

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.logger.log(`Tentando conectar ao RabbitMQ... (Tentativa ${attempt}/${maxAttempts})`)
        
        this.connection = await amqp.connect(rabbitmqUrl)
        this.channel = await this.connection.createConfirmChannel()
        
        this.logger.log('Conexão com RabbitMQ estabelecida com sucesso!')
        return
      } catch (error) {
        this.logger.warn(`Conexão com RabbitMQ falhou na tentativa ${attempt}/${maxAttempts}`)

        if (attempt === maxAttempts) {
          this.logger.error('Número máximo de tentativas atingido. Falha ao conectar ao RabbitMQ.')
          throw error // Lança o erro se for a última tentativa
        }

        // Cálculo do Backoff Exponencial: base * 2^(tentativa - 1)
        // aqui uso o baseDelay x a tentiva -1 ao quadrado. Ex: Tentativa 1 - 2000 * 2^0 = 2000 segundos de espera após a primeira falha
        let delay = baseDelay * (2 ** (attempt - 1))

        // Garante que não vai passar do limite de 30s definido por mim
        delay = Math.min(delay, maxDelay)

        // Adiciona Jitter (Aleatoriedade entre 0 e 1000ms) para evitar colisões entre as tentivas, evitando várias ao mesmo tempo
        const jitter = Math.random() * 1000
        const finalDelay = delay + jitter

        this.logger.log(`Aguardando ${Math.round(finalDelay / 1000)}s antes da próxima tentativa...`);
        await new Promise((resolve) => setTimeout(resolve, finalDelay));
      }
    }
  }

  private async disconnect() {
    try {
      if(this.channel) {
        await this.channel.close()
      }

      if(this.connection) {
        await this.connection.close()
      }

    } catch(error) {
      throw error
    }
  }

 /*
  Implementa 3 tentativas de reenvio da mensagem usando o confirmChannel do canal
 */
  async publishMessage(
    exchange: string,
    routingKey: string,
    message: string,
  ): Promise<boolean> {
    const content = Buffer.from(message)
    const attempts = 3

    for(let attempt = 1; attempt <= attempts; attempt++) {
      try {
        await this.channel.assertExchange(exchange, 'topic', {durable: true})
        await new Promise<void>(async (resolve, reject) => {
          const publish = this.channel.publish( // esse metodo, se o channel for criado com confirmChannel, retorna uma confirmação se realmente foi envida a mensagem
            exchange,
            routingKey,
            content,
            {persistent: true},
            (error) => {
              if(error) {
                reject(error)
              }

              resolve()
            }
          )

          if(!publish) {
            await once(this.channel, 'drain') // once já elimina o listener da memoria evitando memory leak
          }
        })

        this.logger.log(`A mensagem foi enviada na tentativa ${attempt}`)
        return true
      }
      catch(error) {
        const errorValue = error instanceof Error ? error.message : String(error)

        this.logger.error(`O envio da mensagem falhou na tentativa ${attempt}/${attempts}): ${errorValue}`);
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
      }
    }

    return false
  }

  async subscribeToQueue(
    queueName: string,
    exchange: string,
    routingKey: string,
    callback: (message: unknown) => Promise<void>
  ) {
    try {
      if(!this.channel) {
        throw new Error("Channel não disponivel")
      }

      await this.channel.assertExchange(exchange, 'topic')

      const queue = await this.channel.assertQueue(queueName, {
        durable: true,
        arguments: {
          'x-message-ttl': 86400000,
          'x-max-length': 10000
        }
      })

      await this.channel.bindQueue(queue.queue, exchange, routingKey)

      await this.channel.prefetch(1)

      await this.channel.consume(queue.queue, async (msg) => {
        if(msg) {
          try {
            const message = JSON.parse(msg.content.toString());
            this.logger.log(`Menssagem recebida da fila: ${queueName}`)
            this.logger.debug(`Conteúdo da menssagem: ${JSON.stringify(message)}`)
            await callback(message)

            this.channel.ack(msg)

            this.logger.log(
              `Menssagem da fila: ${queueName} processada`,
            )
          } catch (error) {
            this.logger.error(`Erro no processamento:`, error)
            this.channel.nack(msg, false, false)
          }
        }
      })

      this.logger.log(
        `Inscrição na fila: ${queueName} com a routingKey: ${routingKey}`,
      )

    } catch (error) {
      this.logger.error(`Erro ao se increver na fila ${queueName}:`, error);
    }
  }

}