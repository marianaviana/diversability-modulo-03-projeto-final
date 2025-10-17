# diversability-modulo-03-projeto-final

Este projeto é uma aplicação de e-commerce desenvolvida como parte das atividades do Módulo 03 - Front End Dinâmico (JS DOM) da trilha de Front-end Javascript do programa DiversAbility.

# 📋 Descrição do Projeto

Sistema completo de e-commerce com funcionalidades de autenticação, catálogo de produtos, gerenciamento administrativo e persistência de dados local.

# 🚀 Funcionalidades Principais

- Sistema de Autenticação: Login com validação via FakeStoreAPI
- Catálogo de Produtos: Listagem e visualização detalhada de produtos
- Área Administrativa: CRUD completo de produtos
- Persistência Local: Dados salvos no localStorage
- Design Responsivo: Interface adaptável para mobile e desktop
- Modais Dinâmicos: Experiência de usuário fluida

# 🛠 Tecnologias Utilizadas

- TypeScript: Linguagem principal
- HTML5 & CSS3: Estrutura e estilização
- FakeStoreAPI: API para dados de produtos e autenticação
- Vite: Build tool e dev server
- LocalStorage: Persistência de dados local
# 📁 Estrutura do Projeto

```
diversability-modulo-03-projeto-final/
├── src/
│   ├── types/          # Definições TypeScript
│   ├── services/       # Serviços (API, Auth)
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/          # Lógica das páginas
│   └── utils/          # Utilitários
├── css/
│   └── style.css       # Estilos principais
├── index.html          # Página de login
├── home.html           # Página principal
├── admin.html          # Área administrativa
├── sobre.html          # Sobre o projeto
└── configurações...
```

# 🔧 Instalação e Execução
Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

# Comandos de Execução

```
# Clone o repositório
git clone <url-do-repositorio>

# Entre no diretório
cd diversability-modulo-03-projeto-final

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev
```

# 🔑 Credenciais de Teste
- Usuário: `johnd`
- Senha: `m38rmF$`

# 📚 Funcionalidades Detalhadas
### 🔐 Autenticação
- Login com validação de credenciais
- Persistência de sessão
- Proteção de rotas
- Logout seguro

### 🏪 Catálogo de Produtos

- Listagem em grid responsivo
- Modal de detalhes

### ⚙️ Área Administrativa
- Criar: Adicionar novos produtos
- Ler: Listar todos os produtos
- Atualizar: Editar produtos existentes
- Deletar: Remover produtos (apenas usuário "johnd")
- Validação de formulários
- Persistência local

### 💾 Sistema de Persistência
- Combinação de dados da API com dados locais
- Sobrescrita inteligente de produtos
- Fallback para modo offline
- Estatísticas de dados locais

### 🎯 Características Técnicas
- Programação Orientada a Objetos: Estrutura em classes TypeScript
- Clean Code: Código limpo e organizado
- Tratamento de Erros: Validações e mensagens de erro
- JavaScript Assíncrono: Async/await com fetch
- Manipulação Avançada do DOM: Modais dinâmicos
- Responsividade: Design mobile-first

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

## 👥 Autores
   - Mariana Viana - Desenvolvimento e implementação
   - ID Ada da Autora: 1433002
   - Professor: Roosevelt Franklin
   - Ada Tech & Cognizant - Programa DiversAbility
   - Trilha: DiversAbility - Front-end Javascript
   - Instituição: Ada Tech & Cognizant

## 🙋‍♂️ Suporte

Para dúvidas ou problemas:
   - Verifique se todos os arquivos estão na estrutura correta
   - Confirme que o navegador suporta JavaScript ES6+
   - Verifique o console do navegador para erros

______________________

> **Nota:** Este projeto foi desenvolvido para fins educacionais como parte do programa DiversAbility da Ada Tech em parceria com a Cognizant.

