# Sistema de Balneabilidade das Praias de Alagoas 🏖️

Sistema completo para cadastro e monitoramento da balneabilidade das praias do estado de Alagoas, composto por dashboard administrativo, API REST e site público.

## 📋 Visão Geral

O sistema é composto por três aplicações principais:

- **🔧 Dashboard Admin**: Interface para cadastro e gerenciamento dos pontos de balneabilidade
- **🚀 API REST**: Backend em Spring Boot para gerenciamento dos dados
- **🌐 Site Público**: Interface pública em React para visualização dos dados

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Dashboard      │    │   API REST      │    │  Site Público   │
│  Admin          │◄──►│  Spring Boot    │◄──►│  React          │
│  (OpenLayers)   │    │  (Java)         │    │  (Geolocalização)│
│  Porta: 5000    │    │  Porta: 8080    │    │  Porta: 5173    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Funcionalidades

### Dashboard Admin
- 📍 Cadastro de pontos de balneabilidade via mapa interativo
- 🎯 Classificação como "Própria" ou "Imprópria" para banho
- 🗺️ Interface com OpenLayers para visualização geográfica
- 🔄 Sincronização automática com a API

### API REST
- 🛠️ CRUD completo de pontos de balneabilidade
- 📊 Endpoints RESTful padronizados
- 🗄️ Persistência de dados

### Site Público
- 🌍 Visualização de todos os pontos cadastrados
- 📱 Geolocalização do usuário
- 🎨 Interface responsiva
- 🔍 Identificação visual por cores (Verde: Própria | Vermelho: Imprópria)

## 🛠️ Tecnologias Utilizadas

| Componente | Tecnologias |
|------------|-------------|
| **Frontend Admin** | JavaScript, OpenLayers, Vite |
| **API** | Java, Spring Boot, Maven |
| **Frontend Público** | React, JavaScript, OpenLayers |
| **Containerização** | Docker, Docker Compose |
| **Mapeamento** | OpenStreetMap (OSM) |

## 📦 Como Executar com Docker

### Pré-requisitos
- Docker 20.10+
- Docker Compose 2.0+

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd balneabilidade-alagoas
```

### 2. Execute com Docker Compose
```bash
docker-compose up -d
```

### 3. Acesse as aplicações
- **Dashboard Admin**: http://localhost:5000
- **API REST**: http://localhost:8080/api/praias
- **Site Público**: http://localhost:5173

## 🔧 Executar em Desenvolvimento

### Dashboard Admin
```bash
cd balneabilidadeCadastrov2
npm install
npm start
```

### API Spring Boot
```bash
cd BalneabilidadeAPI
./mvnw spring-boot:run
```

### Site Público
```bash
cd balneabilidade-react-app
npm install
npm start
```

## 🐳 Docker Compose

O arquivo docker-compose.yml orquestra os três serviços:

```yaml
version: '3.8'

services:
  balneabilidade-api:
    image: juliomourajr92/balneabilidadeapiv1:latest
    ports:
      - "8080:8080"
    
  balneabilidade-cadastro:
    image: juliomourajr92/balneabilidadeadmin:latest
    ports:
      - "5000:5000"
    depends_on:
      - balneabilidade-api
    
  balneabilidade-site:
    image: juliomourajr92/balneabilidadesite:latest
    ports:
      - "5173:5173"
    depends_on:
      - balneabilidade-api
```

## 📡 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/praias` | Lista todas as praias |
| `POST` | `/api/praias` | Cadastra nova praia |
| `GET` | `/api/praias/{id}` | Busca praia por ID |
| `PUT` | `/api/praias/{id}` | Atualiza praia |
| `DELETE` | `/api/praias/{id}` | Remove praia |

### Formato de Dados
```json
{
  "nome": "Praia de Jatiúca",
  "status": "proprio",
  "coordenadas": [-35.69314, -9.64253]
}
```

## 🎯 Como Usar

### 1. Cadastrar Pontos (Dashboard Admin)
1. Acesse o dashboard em http://localhost:5000
2. Clique no mapa na localização desejada
3. Digite o nome da praia
4. Selecione se é "Própria" ou "Imprópria" para banho
5. O ponto será salvo automaticamente na API

### 2. Visualizar Pontos (Site Público)
1. Acesse o site em http://localhost:5173
2. Ative a geolocalização se desejado
3. Visualize os pontos coloridos no mapa:
   - 🟢 Verde: Própria para banho
   - 🔴 Vermelho: Imprópria para banho

## 📋 Comandos Úteis

```bash
# Ver logs dos containers
docker-compose logs -f

# Parar todos os serviços
docker-compose down

# Rebuild e restart
docker-compose up --build -d

# Verificar status
docker-compose ps

# Limpar volumes (CUIDADO: apaga dados)
docker-compose down -v
```

## 🌊 Sobre o Projeto

Este sistema foi desenvolvido na matéria de praticas extensionistas 2 da Uninter para auxiliar no monitoramento da qualidade das águas das praias de Alagoas, fornecendo informações atualizadas sobre a balneabilidade para a população e órgãos competentes.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

**Desenvolvido com ❤️ para o Estado de Alagoas**
