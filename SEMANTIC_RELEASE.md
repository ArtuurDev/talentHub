# Guia de Semantic Release e Pre-Release (Monorepo TalentHub)

Este documento descreve como o versionamento automático com o **semantic-release** está configurado neste projeto monorepo, como gerenciar **pre-releases** e como realizar a transição para releases estáveis quando os serviços estiverem prontos para produção.

---

## 🚀 Como Funciona o Semantic Release no Projeto

O projeto utiliza um fluxo automatizado via GitHub Actions (configurado em `.github/workflows/`) para realizar a publicação de versões de forma independente em cada serviço sob a pasta `services/`.

A lógica de decisão de novas versões é baseada no padrão de **Conventional Commits**:
*   `fix: ...` $\rightarrow$ Gera um incremento de **Patch** (ex: `0.1.0` $\rightarrow$ `0.1.1`)
*   `feat: ...` $\rightarrow$ Gera um incremento de **Minor** (ex: `0.1.0` $\rightarrow$ `0.2.0`)
*   `feat!:` ou `BREAKING CHANGE:` $\rightarrow$ Gera um incremento de **Major** (ex: `0.1.0` $\rightarrow$ `1.0.0`)

---

## 📝 Guia de Conventional Commits (Tipos e Significados)

Para que o `semantic-release` funcione perfeitamente, o padrão de **Conventional Commits** deve ser seguido nos títulos dos commits. Veja abaixo a lista dos tipos de commits mais utilizados, suas traduções, significados e o impacto na versão:

| Prefixo (Tipo) | Tradução | Significado / Uso | Impacto na Versão |
| :--- | :--- | :--- | :--- |
| **`feat`** (feature) | Funcionalidade | Adição de uma nova funcionalidade ao sistema. | **Minor** (ex: `0.1.0` $\rightarrow$ `0.2.0`) |
| **`fix`** | Correção | Resolução de um bug ou erro no código. | **Patch** (ex: `0.1.0` $\rightarrow$ `0.1.1`) |
| **`perf`** | Performance | Alteração de código que melhora o desempenho. | **Patch** |
| **`chore`** | Tarefa rotineira | Mudanças que não modificam código de produção ou testes (ex: atualizar `.gitignore`, dependências, configurações gerais). | **Nenhum** |
| **`ci`** | Integração Contínua | Alterações nos arquivos de configuração ou scripts de CI/CD (ex: workflows do GitHub, `.releaserc.json`). | **Nenhum** |
| **`docs`** | Documentação | Alterações apenas na documentação do projeto (ex: arquivos `.md`). | **Nenhum** |
| **`style`** | Estilo / Formatação | Mudanças de estilização e formatação do código que não afetam seu comportamento (espaços, aspas, ponto e vírgula). | **Nenhum** |
| **`refactor`** | Refatoração | Alteração de código que não corrige bugs nem adiciona funcionalidades (reorganização para melhorar legibilidade/estrutura). | **Nenhum** |
| **`test`** | Testes | Adição de testes ausentes ou correção de testes existentes. | **Nenhum** |
| **`build`** | Construção | Alterações que afetam o sistema de build ou dependências externas (ex: npm, dockerfile). | **Nenhum** |

### Mudanças Incompatíveis (BREAKING CHANGES)
Qualquer tipo de commit acima que inclua uma exclamação após o tipo (ex: `feat!: ...`) ou a menção `BREAKING CHANGE:` no rodapé do commit significa que houve uma mudança incompatível com versões anteriores.
*   **Impacto na versão:** **Major** (ex: `0.1.0` $\rightarrow$ `1.0.0`).

---

## 🧪 Estrutura de Pre-Release (Ciclo de Desenvolvimento)

Durante a fase de desenvolvimento inicial dos microserviços (ciclo `0.x.x`), as configurações de release devem suportar o lançamento de versões preliminares (pre-releases).

### Configuração no `.releaserc.json` dos serviços:
Para permitir pre-releases nas branches `beta` ou `alpha`, a propriedade `branches` deve estar configurada da seguinte forma no arquivo `.releaserc.json` de cada serviço:

```json
{
  "branches": [
    "main",
    { "name": "beta", "prerelease": true },
    { "name": "alpha", "prerelease": "alpha" }
  ]
}
```

*   **Comportamento:**
    *   Ao empurrar commits para a branch `beta`, o semantic-release calcula a próxima versão incremental estável (com base na última tag estável) e anexa o sufixo `-beta.x`.
    *   **Exemplo:** Se a última tag estável for `v0.1.0` e houver um commit `feat:`, a versão gerada será `v0.2.0-beta.1`.

### Como iniciar o versionamento em Minor (`0.1.0`) ou Patch (`0.0.1`):

#### 1. Configurar o Prefixo Único de Tag (`tagFormat`) para cada Serviço (Crucial para Monorepo)
Como todos os serviços compartilham o mesmo repositório Git, usar a tag padrão do semantic-release (que é apenas `v${version}`) gerará conflito entre os serviços. Para evitar isso, você deve especificar uma propriedade `"tagFormat"` exclusiva com o nome do serviço no `.releaserc.json` de cada um:

*   **`services/api-gateway/.releaserc.json`**:
    ```json
    {
      "tagFormat": "api-gateway-v${version}",
      "branches": ["main"]
    }
    ```
*   **`services/user-service/.releaserc.json`**:
    ```json
    {
      "tagFormat": "user-service-v${version}",
      "branches": ["main"]
    }
    ```
*   **`services/notification-service/.releaserc.json`**:
    ```json
    {
      "tagFormat": "notification-service-v${version}",
      "branches": ["main"]
    }
    ```

#### 2. Criar a Tag Manual na Raiz do Repositório
O Git gerencia o histórico e as tags de forma global. Por isso, **todos os comandos do Git devem ser rodados na pasta raiz do projeto** (onde a pasta `.git` está localizada). Você **não** deve entrar na pasta de cada serviço para rodar os comandos do Git.

Execute localmente no terminal (da pasta raiz):
```bash
# Para iniciar no Minor (0.1.0):
git tag api-gateway-v0.1.0
git tag user-service-v0.1.0
git tag notification-service-v0.1.0

# Ou se quiser iniciar no Patch (0.0.1) alguns deles:
# git tag api-gateway-v0.0.1

# Em seguida, envie todas as tags para o GitHub de uma vez:
git push origin --tags
```

#### 3. Execução Automatizada
Com os prefixos configurados e as tags base enviadas ao GitHub, o semantic-release correspondente a cada serviço calculará os incrementos de forma independente baseando-se apenas na sua respectiva tag (ex: um commit `fix:` no `api-gateway` fará o release de `api-gateway-v0.1.1`).

---

## 🔒 Como Mudar para Semantic Release Normal (Versão Estável)

Quando os seus serviços atingirem um estado de maturidade pronto para produção e você quiser passar a utilizar o **Semantic Release Normal** (sem sufixos de pre-release e visando versões estáveis definitivas):

### Passo 1: Atualizar o arquivo `.releaserc.json` de cada serviço
Remova as configurações de pre-release (as branches `beta` ou `alpha` como objetos de pre-release) do array de `branches`, deixando apenas a branch estável principal (ou as demais branches apenas sem a propriedade `prerelease`):

```json
{
  "branches": [
    "main"
  ]
}
```

### Passo 2: Promover o ciclo à versão estável `1.0.0`
Para marcar a transição do ciclo de desenvolvimento `0.x.x` para a primeira versão estável oficial (`1.0.0`):
1.  **Via Commits Convencionais (Recomendado):**
    Adicione no commit de integração à branch `main` a sintaxe de `BREAKING CHANGE` para forçar a promoção do Major bump para `1.0.0`:
    ```text
    feat: lançamento da primeira versão estável

    BREAKING CHANGE: primeiro release estável do serviço pronto para produção.
    ```
2.  **Via Git Tag manual:**
    Caso prefira fixar a versão inicial manualmente antes do pipeline rodar, lembre-se de usar o prefixo correspondente ao serviço criado no passo anterior. Execute a partir da **raiz** do repositório:
    ```bash
    git tag api-gateway-v1.0.0
    git tag user-service-v1.0.0
    git tag notification-service-v1.0.0
    git push origin --tags
    ```
    *Nota:* O semantic-release automaticamente continuará a incrementar a partir de `1.0.0` (ex: `1.0.1`, `1.1.0`, etc.) de acordo com os novos commits.

---

## ⚠️ Checklist para Resolução de Problemas Comuns (Monorepo)

Se a automação no GitHub Actions falhar, valide os seguintes pontos:
1.  **Diretório de Workflows:** A pasta raiz das ações deve se chamar exatamente `.github` (com ponto). Se estiver como `github`, as ações não rodarão.
2.  **Caminho do Serviço (`working_directory`):** No workflow, certifique-se de usar a propriedade correta no passo `cycjimmy/semantic-release-action`:
    *   Incorreto: `working_diretory` (erro de digitação)
    *   Correto: `working_directory`
3.  **Nome do arquivo de configuração:**
    *   Incorreto: `.realease.rc` ou `.realeaserc.json`
    *   Correto: `.releaserc` ou `.releaserc.json`
