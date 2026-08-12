# [0.6.0](https://github.com/ArtuurDev/talentHub/compare/user-service-v0.5.0...user-service-v0.6.0) (2026-08-12)


### Bug Fixes

* **api-gateway:** declara axios no serviço correto ([0c78452](https://github.com/ArtuurDev/talentHub/commit/0c784527d6da4dceecddd10ab22610032435277d))
* **api-gateway:** remover importação ([bcd6414](https://github.com/ArtuurDev/talentHub/commit/bcd6414b8e592390ae9aaf2e2612ae2d93e6003f))
* **user-service:** adicionar sessionId no retorno do controller ([3e3f9d4](https://github.com/ArtuurDev/talentHub/commit/3e3f9d4bc07282da093a3e22dee2408e1d1d3fed))
* **user-service:** corrige contrato de cadastro e erro persistido ([73850d3](https://github.com/ArtuurDev/talentHub/commit/73850d369eeee282b012cf3b229866e05aa35391))
* **user-service:** corrigir bug ([e5a0ccf](https://github.com/ArtuurDev/talentHub/commit/e5a0ccf267832766b856aaa53e3c436513c28b43))
* **user-service:** retirar assinatura do refreshToken nos cookies do user service ([2df845d](https://github.com/ArtuurDev/talentHub/commit/2df845d9a20ce7f5e8da097dc091706b59655f18))


### Features

* **api-gateway:** adicionar refrehToken nos cookies ([a1be80b](https://github.com/ArtuurDev/talentHub/commit/a1be80b8efe7e7695bb5035a2f08c5ecc137f539))
* **api-gateway:** implementar autenticação com jwt e refresh token ([895ce4f](https://github.com/ArtuurDev/talentHub/commit/895ce4f5e13ac48ef11323c3a19d209643b6459a))
* **api-gateway:** implementar fluxo de refresh token com sessão ([58840e6](https://github.com/ArtuurDev/talentHub/commit/58840e62a8008ee4c7afb880a91f15c6b87282a9))
* **api-gateway:** protege rotas e propaga erros de serviços ([7104781](https://github.com/ArtuurDev/talentHub/commit/71047810591e5862c82370f38767f00fad7fa636))
* **user-service:** adicionar atualização de usuario ([740e486](https://github.com/ArtuurDev/talentHub/commit/740e486764c85f1b6a08a052821ca55f621584ca))
* **user-service:** adicionar busca de perfil ([71c12ce](https://github.com/ArtuurDev/talentHub/commit/71c12ceab103297df52ef3af61f1990b0b0bb173))
* **user-service:** adicionar container postgres ([52aa8d8](https://github.com/ArtuurDev/talentHub/commit/52aa8d8da51f9140da560baf4bd36f7c6a75b3c2))
* **user-service:** adicionar contratos de conta e jwt ([66d3cd3](https://github.com/ArtuurDev/talentHub/commit/66d3cd38589c79c30d128ba2da716185607f9462))
* **user-service:** adicionar descrição ao perfil ([87d7b5f](https://github.com/ArtuurDev/talentHub/commit/87d7b5f913905a946ca9cff5b05948556129f1e4))
* **user-service:** adicionar exclusão de conta ([5efef0d](https://github.com/ArtuurDev/talentHub/commit/5efef0d64e159667ca2833e6c3d67eec478f9af9))
* **user-service:** adicionar habilidades de talentos ([db2a18e](https://github.com/ArtuurDev/talentHub/commit/db2a18e2ee5afdf066b7072bb82789ad1b8a4204))
* **user-service:** adicionar login de usuario ([0f382c4](https://github.com/ArtuurDev/talentHub/commit/0f382c4eb11841f4d848d8232e40c852a52e85b7))
* **user-service:** adicionar persistência de sessões ([b581956](https://github.com/ArtuurDev/talentHub/commit/b581956cc101e2fca79de2555f5233018e720ce2))
* **user-service:** adiconar pipes e modulo de criptografia ([5f23c32](https://github.com/ArtuurDev/talentHub/commit/5f23c32d1c70361aa0119b016b169a87dc7e00e1))
* **user-service:** implementa rotação segura de refresh token ([33dd4ab](https://github.com/ArtuurDev/talentHub/commit/33dd4ab767b192628fc2b18b0b0ffae363f54494))
* **user-service:** implementado configs do prisma e criando schema de user ([79ebcad](https://github.com/ArtuurDev/talentHub/commit/79ebcad884daa4c1fbca92e5c713da0f9166265a))
* **user-service:** implementar busca das habilidades ([dd32f35](https://github.com/ArtuurDev/talentHub/commit/dd32f35f69ecbc12b0e8e909f980c8ee8fab8f1e))
* **user-service:** implementar controllers de user ([98c3011](https://github.com/ArtuurDev/talentHub/commit/98c3011198075cd450fe4a73b90ba8010f9a3c4c))
* **user-service:** implementar criação de usuário ([6287286](https://github.com/ArtuurDev/talentHub/commit/6287286046eb89bbf3440c85b95f79b67ca55f67))
* **user-service:** implementar criação de usuario e testes unitarios ([07a4240](https://github.com/ArtuurDev/talentHub/commit/07a424023015bffbb97309a8276b3501e639d0da))
* **user-service:** implementar sessões com refresh token ([83f6e05](https://github.com/ArtuurDev/talentHub/commit/83f6e058de82e5b5952fe3df2289bcdb6500120c))

# [0.5.0](https://github.com/ArtuurDev/talentHub/compare/user-service-v0.4.0...user-service-v0.5.0) (2026-08-10)


### Features

* **user-service:** implementar busca das habilidades ([2de381b](https://github.com/ArtuurDev/talentHub/commit/2de381b350870142fd9a2407e724de4691fbfb81))

# [0.4.0](https://github.com/ArtuurDev/talentHub/compare/user-service-v0.3.0...user-service-v0.4.0) (2026-08-10)


### Features

* **user-service:** adicionar descrição ao perfil ([65d512e](https://github.com/ArtuurDev/talentHub/commit/65d512ecb3f4c33bea22ee49d6a49f424e39fb70))
* **user-service:** adicionar habilidades de talentos ([92ebb33](https://github.com/ArtuurDev/talentHub/commit/92ebb3366993eecbb405ede5ee1b617f3d8081b8))

# [0.3.0](https://github.com/ArtuurDev/talentHub/compare/user-service-v0.2.0...user-service-v0.3.0) (2026-08-10)


### Features

* **user-service:** implementar sessões com refresh token ([07193c8](https://github.com/ArtuurDev/talentHub/commit/07193c83c2ecba8b6d284b0437553ac1ba40cb62))

# [0.2.0](https://github.com/ArtuurDev/talentHub/compare/user-service-v0.1.0...user-service-v0.2.0) (2026-08-10)


### Bug Fixes

* **user-service:** corrigir bug ([efb18d8](https://github.com/ArtuurDev/talentHub/commit/efb18d897828c08aff90c719f9f588c5a90218e6))


### Features

* **api-gateway:** adicionar configuração de CORS e helmet ([801c2b3](https://github.com/ArtuurDev/talentHub/commit/801c2b3fd8f3f241c9aa4651a2ff88697fd911e9))
* **api-gateway:** disparar release do proxy service ([db02c8d](https://github.com/ArtuurDev/talentHub/commit/db02c8df6e01c410a06d736aaad46962eb29a68e))
* **api-gateway:** imlementar proxy service e ajustar paths de ci ([d3de27a](https://github.com/ArtuurDev/talentHub/commit/d3de27a4de29bc67f5e7f2a1a7dde35025634ca9))
* **api-gateway:** implementar middleware de logging ([aabe122](https://github.com/ArtuurDev/talentHub/commit/aabe1228d73822aeeebdec697c2cbef2abd8d03f))
* **user-service:** adicionar atualização de usuario ([4461a19](https://github.com/ArtuurDev/talentHub/commit/4461a1936faead38725778ab6bcc97031a1bc64d))
* **user-service:** adicionar busca de perfil ([fac4a26](https://github.com/ArtuurDev/talentHub/commit/fac4a26a7ca69ec6ddc59198f25d1c10e866f074))
* **user-service:** adicionar container postgres ([03fbe7d](https://github.com/ArtuurDev/talentHub/commit/03fbe7d328e3dbfe9ca1bafe355209c6f7744afa))
* **user-service:** adicionar contratos de conta e jwt ([24a47d7](https://github.com/ArtuurDev/talentHub/commit/24a47d7ca5c693c8aeceb45c7bab268d6f23de35))
* **user-service:** adicionar exclusão de conta ([5cb3f91](https://github.com/ArtuurDev/talentHub/commit/5cb3f91bf300ef53af8c1cef5efb461e4f8984fb))
* **user-service:** adicionar login de usuario ([aa0911e](https://github.com/ArtuurDev/talentHub/commit/aa0911e03736a3b3f0310562f07ba6e829cc77cc))
* **user-service:** adicionar persistência de sessões ([7822d9f](https://github.com/ArtuurDev/talentHub/commit/7822d9fee066e652dfda4329d6f4be58568a4205))
* **user-service:** adiconar pipes e modulo de criptografia ([bdc4d0f](https://github.com/ArtuurDev/talentHub/commit/bdc4d0f3d880b73e1c296ed8b45990162d1c5f13))
* **user-service:** implementado configs do prisma e criando schema de user ([0bb3cfe](https://github.com/ArtuurDev/talentHub/commit/0bb3cfec6b77d1f4f520df793d424945030fef46))
* **user-service:** implementar controllers de user ([fcd473d](https://github.com/ArtuurDev/talentHub/commit/fcd473d44d1f8676dea3aae799ac344bbff64b9e))
* **user-service:** implementar criação de usuário ([be0677f](https://github.com/ArtuurDev/talentHub/commit/be0677ff2ff324208f6f2840b9b0a3b2f9db9e06))
* **user-service:** implementar criação de usuario e testes unitarios ([3b23ae8](https://github.com/ArtuurDev/talentHub/commit/3b23ae8f53551814ffd40fe5e61bf256047b4660))
