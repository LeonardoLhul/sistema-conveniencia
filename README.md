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

/backend
- app.py
- auth.py
- db.py
- stock.py
- report.py

/frontend
- src/
- components/
- pages/
- services/

## Como executar

Backend:
```bash
cd backend
pip install -r requirements.txt
python app.py
