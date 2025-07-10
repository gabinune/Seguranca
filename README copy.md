# 🔒 Frontend Security Lab

![Security Lab](https://img.shields.io/badge/Security-Educational-red)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![Material%20UI](https://img.shields.io/badge/Material%20UI-Latest-blue)
![Vite](https://img.shields.io/badge/Vite-7.0.3-purple)

Uma aplicação educacional interativa para demonstrar vulnerabilidades comuns em desenvolvimento frontend e suas soluções.

## 🎯 Objetivo

Este laboratório foi criado para demonstrar de forma prática as principais vulnerabilidades de segurança em aplicações frontend, incluindo:

- **XSS (Cross-Site Scripting)** - Injeção de scripts maliciosos
- **Exposição de Dados Sensíveis** - Armazenamento inseguro de tokens
- **CSRF (Cross-Site Request Forgery)** - Requisições maliciosas não autorizadas  
- **CORS Mal Configurado** - Políticas permissivas demais
- **Clickjacking** - Sobreposição de elementos invisíveis

## 🚨 ⚠️ Aviso Importante

**Esta aplicação contém vulnerabilidades intencionais para fins educacionais.**

❌ **NÃO use estes exemplos em produção!**
✅ **Use apenas para aprendizado e treinamento**

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação e Execução
```bash
# Clone o repositório
git clone <repo-url>

# Entre no diretório
cd frontend-security-lab

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run dev

# Acesse http://localhost:5173
```

## 📚 O que Você Vai Aprender

### 1. **XSS - Cross-Site Scripting**
- Como scripts maliciosos são injetados
- Diferença entre `dangerouslySetInnerHTML` e texto simples
- Uso do DOMPurify para sanitização
- Headers CSP (Content Security Policy)

### 2. **Exposição de Dados Sensíveis**
- Problemas com localStorage/sessionStorage
- Por que tokens JWT não devem ficar no cliente
- Configuração segura de cookies (httpOnly, secure, sameSite)
- Simulação de roubo de dados via XSS

### 3. **CSRF - Cross-Site Request Forgery**
- Como ataques CSRF funcionam
- Implementação de tokens CSRF
- Configuração de cookies SameSite
- Validação de origem e referer

### 4. **CORS Mal Configurado**
- Riscos de `Access-Control-Allow-Origin: *`
- Configuração restritiva de CORS
- Lista de origens confiáveis
- Preflight requests e headers complexos

### 5. **Clickjacking**
- Sobreposição invisível de elementos
- Headers `X-Frame-Options` e CSP `frame-ancestors`
- Frame busting com JavaScript
- Tipos de ataques (bancário, webcam, likejacking)

## 🛠️ Tecnologias Utilizadas

- **React 19** - Framework frontend
- **Material-UI** - Biblioteca de componentes
- **Vite** - Build tool e dev server
- **TypeScript** - Type safety
- **React Syntax Highlighter** - Destaque de código
- **DOMPurify** - Sanitização de HTML

## 📖 Como Usar Cada Demo

### 1. **Navegação por Abas**
Use as abas superiores para alternar entre diferentes vulnerabilidades.

### 2. **Teste Prático**
Cada demo inclui:
- ✅ **Exemplo seguro** - Como implementar corretamente
- ❌ **Exemplo vulnerável** - O que NÃO fazer
- 🧪 **Área de teste** - Experimente ataques simulados
- 📝 **Código de exemplo** - Implementações práticas

### 3. **Simulações Interativas**
- Digite inputs maliciosos para ver XSS em ação
- Teste diferentes políticas CORS
- Simule ataques CSRF
- Veja clickjacking funcionando

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Lint do código
npm run lint

# Preview do build
npm run preview
```

## 🎓 Para Educadores

Este laboratório é ideal para:

- **Cursos de Segurança Web** - Demonstrações práticas
- **Workshops de Frontend** - Boas práticas de segurança
- **Treinamentos Corporativos** - Conscientização sobre vulnerabilidades
- **Apresentações Técnicas** - Exemplos visuais e interativos

## 📋 Checklist de Segurança Frontend

Baseado nos demos desta aplicação:

### ✅ **XSS Prevention**
- [ ] Evitar `dangerouslySetInnerHTML`
- [ ] Usar bibliotecas de sanitização (DOMPurify)
- [ ] Configurar Content Security Policy
- [ ] Validar inputs no backend

### ✅ **Secure Data Storage**
- [ ] Usar cookies httpOnly para tokens
- [ ] Configurar flags Secure e SameSite
- [ ] Evitar localStorage para dados sensíveis
- [ ] Implementar rotação de tokens

### ✅ **CSRF Protection**
- [ ] Implementar tokens CSRF
- [ ] Configurar SameSite cookies
- [ ] Validar origem das requisições
- [ ] Usar métodos HTTP apropriados

### ✅ **CORS Configuration**
- [ ] Listar origens específicas
- [ ] Evitar `Access-Control-Allow-Origin: *`
- [ ] Restringir métodos e headers
- [ ] Validar no backend

### ✅ **Clickjacking Prevention**
- [ ] Configurar `X-Frame-Options`
- [ ] Usar CSP `frame-ancestors`
- [ ] Implementar frame busting (backup)
- [ ] Testar em diferentes browsers

## 🤝 Contribuições

Contribuições são bem-vindas! Se você:

- Encontrou bugs ou melhorias
- Quer adicionar novas vulnerabilidades
- Tem sugestões de conteúdo educacional
- Quer melhorar a documentação

Abra uma issue ou pull request!

## 📜 Licença

Este projeto é para fins educacionais. Use responsavelmente.

---

**Desenvolvido para demonstrar vulnerabilidades de segurança de forma educacional e responsável.**

🔒 **Lembre-se: A segurança é um processo contínuo, não um destino!**
