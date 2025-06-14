# Projeto Engenharia de Software

Autores: André, Erick, Eber e Gustavo

## Descrição do Sistema

O objetivo principal deste sistema é possibilitar o manejo e a previsão de tarefas relacionadas a um repositório no GitHub. Para isso, as funcionalidades essenciais incluem:

- Uso e manejo de cartões interativos para organização das tarefas;
- Captura automática de informações de um repositório do GitHub, como *issues*, *pull requests*, entre outros;
- Controle de datas nos cartões com sistema de notificações.

Este projeto se inspira na aba **Projects** do GitHub, que exibe *issues* e tarefas em formato **Kanban**. No entanto, o objetivo é aprimorar as funcionalidades já existentes, oferecendo uma experiência mais completa e eficiente.

## Tecnologias Utilizadas

- **Frontend**: React + TailwindCSS + ShadCN/UI  
- **Backend**: Electron.js (focado em aplicações desktop)  
- **Banco de Dados**: SQLite

## Execução do projeto
- **Importante**: Caso esteja utilizando o Windows, é necessário estar com o *Docker Desktop* aberto;
- Após isso, só resta executar os seguintes comando:
```bash
>> npm install
>> docker compose up
```
- Assim, o projeto estará disponível para acesso no browser em: *localhost:6969*
