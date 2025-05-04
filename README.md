# Sistema de Monitoramento de Escalas de Abate

Este é o código-fonte da aplicação web para monitoramento de escalas de abate, desenvolvida com Next.js, TypeScript, Prisma, SQLite e Shadcn/UI.

## Pré-requisitos

*   Node.js (versão 20 ou superior recomendada)
*   npm (geralmente vem com o Node.js)

## Configuração e Instalação

1.  **Descompacte o arquivo ZIP:** Extraia o conteúdo deste arquivo ZIP em um diretório de sua escolha.
2.  **Navegue até o diretório:** Abra um terminal ou prompt de comando e navegue até o diretório onde você extraiu os arquivos (o diretório `sistema_abate_apple_ui`).

    ```bash
    cd caminho/para/sistema_abate_apple_ui
    ```

3.  **Instale as dependências:** Execute o seguinte comando para instalar todas as bibliotecas necessárias para o projeto. Pode levar alguns minutos.

    ```bash
    npm install
    ```
    *Observação: Se você encontrar problemas persistentes com `npm install` semelhantes aos que tivemos durante o desenvolvimento, pode ser necessário investigar problemas específicos do seu ambiente npm (limpar cache com `npm cache clean --force`, verificar versões, etc.) ou tentar usar um gerenciador de pacotes alternativo como `yarn` ou `pnpm`.* 

4.  **Configure o Banco de Dados (SQLite):** O projeto está configurado para usar um banco de dados SQLite local (`dev.db`). Execute os seguintes comandos do Prisma para criar o banco de dados e popular com dados de exemplo:

    ```bash
    npx prisma migrate dev --name init
    npx prisma db seed
    ```
    *O comando `migrate` criará o arquivo `prisma/dev.db` e as tabelas. O comando `seed` (usando `prisma/seed.js`) adicionará alguns produtores, plantas e escalas de exemplo.*

## Executando a Aplicação

1.  **Modo de Desenvolvimento:** Para rodar a aplicação em modo de desenvolvimento (com recarregamento automático ao salvar alterações):

    ```bash
    npm run dev
    ```
    A aplicação estará disponível em `http://localhost:3000` (ou outra porta se a 3000 estiver ocupada).

2.  **Modo de Produção:** Para criar uma versão otimizada e rodar em modo de produção:

    ```bash
    npm run build
    npm start
    ```
    A aplicação estará disponível em `http://localhost:3000` (ou a porta especificada, por padrão 3000).

## Funcionalidades Implementadas

*   Dashboard com KPIs, gráfico de status e atividade recente.
*   Calendário interativo com visualização de escalas.
*   Gerenciamento completo de escalas (Adicionar, Editar, Excluir) com filtros e ordenação.
*   Interface responsiva com tema claro/escuro e animações sutis.

## Funcionalidades Pendentes

*   **Notificações Externas:** O envio de notificações por e-mail ou WhatsApp não foi implementado devido a problemas persistentes com a instalação de dependências (`nodemailer`, etc.) no ambiente de desenvolvimento original. A integração precisará ser feita no seu ambiente.
*   **Gráficos/Tabelas Avançadas:** A instalação de bibliotecas como `TanStack Table` e `Nivo` falhou no ambiente original. A tabela de escalas e o gráfico do dashboard foram implementados com componentes básicos/Recharts. Funcionalidades mais avançadas (filtros complexos, mapas de calor, etc.) podem ser adicionadas instalando essas bibliotecas no seu ambiente.

Esperamos que você consiga executar a aplicação com sucesso em seu ambiente! Se precisar de ajuda adicional, por favor, entre em contato.

