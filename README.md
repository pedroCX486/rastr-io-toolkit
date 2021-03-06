# Rastr-io Toolkit

Um toolkit para rastreamento de códigos dos Correios (Brasil).
  
Projeto criado com framework [Angular](https://github.com/angular/angular-cli), utilizando como backend [Node.JS](https://nodejs.org).

## WebApp

### Development

Rode `npm start` para um servidor em dev e aponte seu browser para `http://localhost:4200/` (ou aguarde o compilador abrir). Após qualquer alteração a aplicação recarregará automáticamente.

### Build

Rode `npm run build` para compilar. Todos os builds são colocados na pasta `dist/`. Para rodar um build que aponte para a subpasta `/rastr-io/` (recomendado) rode o comando `npm run subfolder-build`.

## Environment Variables

O projeto tem algumas variáveis de ambiente na pasta `environments` que você pode precisar ajustar para seus ambientes de dev e prod.

### WebAPI

É necessário `nodemon` para executar localmente.  
Também é preciso existir a pasta `api_cache` com permissão de escrita fora da pasta da API.  
  
Forkado originalmente daqui: https://github.com/edilsonborges/correios-rest-api
  
## Licenças

Licenciando sob a WTFPL.

## Contribuindo

Só fazer uma pull request.

## TODO

- Adicionar possiblidade de importar/exportar backup do localStorage como JSON. (Atualmente só existe sincronização para o servidor da API.)
