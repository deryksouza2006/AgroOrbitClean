# AgroOrbit Mobile

Aplicativo mobile desenvolvido para a **Global Solution 2026/1 — FIAP**, dentro do tema de economia espacial aplicada a problemas reais na Terra.

O AgroOrbit apoia o monitoramento agrícola por meio do cadastro de fazendas, talhões, sensores, coletas IoT simuladas, dados NDVI simulados, análise de risco pela API e visualização de alertas/recomendações.

## Solução

A proposta do projeto é conectar tecnologias inspiradas na observação da Terra ao agronegócio. Nesta versão da Sprint Mobile, o aplicativo registra dados simulados de IoT e NDVI em uma API Java real, permitindo demonstrar o fluxo completo de monitoramento e análise sem depender de hardware físico ou de consumo real do Sentinel Hub durante a avaliação.

Fluxo principal:

```text
Produtor
→ Fazenda
→ Talhão com área/posição
→ Sensor instalado
→ Coleta IoT simulada
→ NDVI simulado
→ Análise de risco pela API
→ Alertas e recomendações
→ Dashboard consolidado
```

> Observação importante: o NDVI e as leituras IoT são simulados no app para fins de protótipo/MVP, mas são persistidos e consultados pela API real. A integração real com Sentinel Hub e dispositivos físicos pode ser evoluída em versões futuras.

## Tecnologias utilizadas

| Tecnologia | Versão | Uso |
|---|---:|---|
| Expo | ~54.0.34 | Plataforma base do app |
| React Native | 0.81.5 | Interface mobile |
| React | 19.1.0 | Base de componentes |
| TypeScript | ~5.9.2 | Tipagem estática |
| React Navigation | 7.x | Drawer e Stack navigation |
| Axios | ^1.16.1 | Comunicação com a API Java |
| AsyncStorage | 2.2.0 | Persistência da sessão JWT |
| lucide-react-native | ^0.475.0 | Ícones da interface |
| react-native-svg | 15.12.1 | Ícones SVG e gráfico NDVI |
| react-native-webview | 13.15.0 | Apoio à visualização/seleção de mapa |

## Integração com a API

A URL da API está centralizada em:

```text
src/services/api.ts
```

URL atual:

```text
https://gs1-java-production.up.railway.app
```

A autenticação utiliza JWT. Após login/cadastro, o token é salvo com AsyncStorage e enviado no header `Authorization: Bearer <token>`.

Os dados principais são buscados e persistidos pela API:

- Usuário/autenticação
- Fazendas
- Talhões
- Sensores
- Leituras IoT
- Dados NDVI
- Análise de risco
- Alertas
- Recomendações

### Autenticação

- Cadastro de produtor
- Login com e-mail e senha
- Persistência de sessão
- Logout com limpeza de sessão

### Dashboard

- Total de fazendas cadastradas
- Total de talhões monitorados
- Sensores ativos
- Alertas abertos
- NDVI médio
- Status geral
- Gráfico com os últimos registros NDVI
- Alertas recentes
- Talhões em risco

### Fazendas

- Listar fazendas do usuário logado
- Cadastrar fazenda
- Editar fazenda
- Excluir fazenda
- Ver talhões de uma fazenda específica

### Talhões

- Listar todos os talhões do usuário
- Listar talhões filtrados por fazenda
- Cadastrar talhão
- Editar talhão
- Excluir talhão
- Selecionar área/posição no mapa
- Visualizar detalhes do talhão

### Sensores e IoT

- Cadastrar sensor no talhão
- Listar sensores do talhão
- Excluir sensor
- Gerar coleta IoT simulada e salvar pela API
- Exibir temperatura, umidade do ar, umidade do solo e data/hora da leitura

### NDVI

- Gerar dado NDVI simulado e salvar pela API
- Exibir NDVI médio, mínimo, máximo, temperatura de superfície, cobertura de nuvem e data de captura
- Refletir os dados no Dashboard

### Análise de risco

- Iniciar análise a partir dos dados mais recentes de IoT e NDVI
- Consultar resultado da API
- Exibir risco identificado, severidade e recomendação principal

### Alertas e recomendações

- Listar alertas por status
- Resolver alertas
- Listar recomendações geradas pela análise

## Estrutura de pastas

```text
AgroOrbit/
├── App.tsx
├── index.ts
├── src/
│   ├── components/       # Componentes reutilizáveis
│   ├── constants/        # Tema e rotas da API
│   ├── contexts/         # Autenticação e sessão
│   ├── navigation/       # Drawer, stacks e tipos de navegação
│   ├── screens/          # Telas do aplicativo
│   ├── services/         # Comunicação com a API
│   ├── types/            # Tipos TypeScript
│   └── utils/            # Mappers, formatadores, validações e helpers
```

## Como executar

Pré-requisitos:

- Node.js 20+
- npm
- Expo Go ou emulador Android/iOS

Instalação:

```bash
npm install
```

Executar o app:

```bash
npx expo start -c
```

Executar no Android:

```bash
npm run android
```

Executar no iOS:

```bash
npm run ios
```

Executar no navegador:

```bash
npm run web
```

## Integrantes

| Nome | RM |
|---|---|
| Lucas Gonçalves Viana | RM |
| Deryk de Souza Queiroz | RM563412 |
| Vinicius Paschoeto da Silva | RM |

## Links

- Repositório: inserir link do GitHub Classroom
- API Railway: https://gs1-java-production.up.railway.app
- Swagger: https://gs1-java-production.up.railway.app/swagger-ui/index.html
- Vídeo de demonstração: inserir link do YouTube

## Turma

2TDS — Global Solution 2026/1 — FIAP
