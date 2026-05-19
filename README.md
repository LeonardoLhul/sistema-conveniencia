# Sistema de Conveniência

Sistema para controle de vendas e estoque de uma conveniência, desenvolvido como uma aplicação full-stack com frontend e backend separados.

## Sobre o projeto

A aplicação foi construída para simular um ambiente real de ponto de venda (PDV), permitindo o gerenciamento de produtos, registro de vendas e controle de estoque.

Funcionalidades principais:
- Registro de vendas
- Controle de estoque
- Gestão de produtos e categorias
- Relatórios de vendas
- Autenticação de usuários

## Arquitetura

O sistema segue uma arquitetura full-stack desacoplada:

- Frontend: aplicação SPA
- Backend: API REST
- Banco de dados: relacional (MySQL)

## Tecnologias utilizadas

Frontend:
- React.js
- TypeScript
- Vite
- TailwindCSS

Backend:
- Python
- Flask
- JWT para autenticação
- Flask-CORS

Banco de dados:
- MySQL

## Estrutura do projeto

O projeto foi organizado separando as responsabilidades entre backend e frontend:

```txt
sistema-conveniencia/
│
├── backend/
│   ├── app.py          # Arquivo principal da API Flask
│   ├── auth.py         # Autenticação e geração de token JWT
│   ├── db.py           # Conexão com o banco de dados MySQL
│   ├── stock.py        # Regras e operações relacionadas ao estoque
│   ├── report.py       # Consultas e relatórios de vendas
│   └── requirements.txt
│
├── frontend/
│   ├── src/            # Código principal da aplicação React
│   ├── components/     # Componentes reutilizáveis da interface
│   ├── pages/          # Páginas principais do sistema
│   ├── services/       # Comunicação com a API
│   └── package.json
│
└── README.md
```
# Backend
```txtcd backend
pip install -r requirements.txt
python app.py
```
# Frontend
```txtcd ../frontend
npm install
npm run dev
```

## Como executar

Backend:
```bash
cd backend
pip install -r requirements.txt
python app.py
