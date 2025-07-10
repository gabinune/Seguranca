import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Box,
  Stack,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel
} from '@mui/material';
import { ExpandMore, Warning, CheckCircle, Code, Security, Gavel } from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CSRFDemo: React.FC = () => {
  const [email, setEmail] = useState('user@example.com');
  const [newEmail, setNewEmail] = useState('');
  const [csrfProtectionEnabled, setCsrfProtectionEnabled] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [attackExecuted, setAttackExecuted] = useState(false);

  // Simular geração de token CSRF
  const generateCSRFToken = () => {
    const token = `csrf_${Math.random().toString(36).substring(2, 15)}`;
    setCsrfToken(token);
    return token;
  };

  // Simular mudança de email (vulnerável)
  const handleVulnerableEmailChange = () => {
    if (newEmail) {
      setEmail(newEmail);
      setNewEmail('');
      alert(`✅ Email alterado para: ${newEmail}`);
    }
  };

  // Simular mudança de email (protegida)
  const handleSecureEmailChange = () => {
    if (!csrfToken) {
      alert('❌ Token CSRF necessário! Gerando token...');
      generateCSRFToken();
      return;
    }

    if (newEmail) {
      setEmail(newEmail);
      setNewEmail('');
      setCsrfToken(''); // Token usado uma vez
      alert(`✅ Email alterado com segurança para: ${newEmail}`);
    }
  };

  // Simular ataque CSRF
  const simulateCSRFAttack = () => {
    if (csrfProtectionEnabled) {
      alert('🛡️ Ataque CSRF bloqueado! Token CSRF obrigatório.');
    } else {
      setEmail('hacker@malicious.com');
      setAttackExecuted(true);
      alert('💀 Ataque CSRF executado! Email alterado pelo atacante.');
    }
  };

  const vulnerableCode = `// ❌ VULNERÁVEL - Sem proteção CSRF
app.post('/api/change-email', (req, res) => {
  const { userId, newEmail } = req.body;
  
  // PROBLEMA: Aceita qualquer requisição POST
  // Não verifica origem ou token
  updateUserEmail(userId, newEmail);
  
  res.json({ success: true });
});

// Frontend vulnerável
function changeEmail(newEmail) {
  fetch('/api/change-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      userId: getCurrentUserId(), 
      newEmail 
    })
  });
}`;

  const maliciousCode = `<!-- Ataque CSRF - Site malicioso -->
<img src="https://vulnerable-app.com/api/change-email" 
     style="display:none"
     onload="
       fetch('https://vulnerable-app.com/api/change-email', {
         method: 'POST',
         credentials: 'include', // Inclui cookies de sessão
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           userId: '123',
           newEmail: 'hacker@evil.com'
         })
       });
     " />

<!-- Ou usando form oculto -->
<form action="https://vulnerable-app.com/api/change-email" 
      method="POST" 
      style="display:none" 
      name="csrfAttack">
  <input name="userId" value="123" />
  <input name="newEmail" value="hacker@evil.com" />
</form>
<script>document.csrfAttack.submit();</script>`;

  const safeCode = `// ✅ SEGURO - Com proteção CSRF
app.post('/api/change-email', csrfProtection, (req, res) => {
  const { userId, newEmail, csrfToken } = req.body;
  
  // Verificar token CSRF
  if (!isValidCSRFToken(csrfToken, req.session)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  // Verificar origem
  const origin = req.get('origin');
  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({ error: 'Forbidden origin' });
  }
  
  updateUserEmail(userId, newEmail);
  res.json({ success: true });
});

// Frontend seguro
function changeEmail(newEmail) {
  const csrfToken = getCSRFToken(); // Do meta tag ou cookie
  
  fetch('/api/change-email', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify({ 
      userId: getCurrentUserId(), 
      newEmail,
      csrfToken
    })
  });
}`;

  const protectionHeaders = `// Headers de proteção CSRF
app.use((req, res, next) => {
  // SameSite cookies
  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' // Bloqueia requests cross-site
  });
  
  // Verificar Referer
  if (req.method === 'POST') {
    const referer = req.get('referer');
    if (!referer || !referer.startsWith(process.env.ALLOWED_ORIGIN)) {
      return res.status(403).json({ error: 'Invalid referer' });
    }
  }
  
  next();
});`;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Gavel color="error" />
        CSRF - Cross-Site Request Forgery
      </Typography>

      <Alert severity="error" sx={{ mb: 3 }}>
        <strong>O que é CSRF?</strong><br />
        CSRF força usuários autenticados a executar ações não intencionais em aplicações web 
        onde estão autenticados. O atacante engana o usuário para fazer requisições maliciosas 
        usando suas credenciais de sessão.
      </Alert>

      <Stack spacing={3}>
        {/* Estado Atual */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              👤 Conta do Usuário Simulada
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="body1">
                <strong>Email atual:</strong> {email}
              </Typography>
              {attackExecuted && (
                <Chip label="COMPROMETIDO" color="error" size="small" />
              )}
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={csrfProtectionEnabled}
                  onChange={(e) => setCsrfProtectionEnabled(e.target.checked)}
                />
              }
              label={csrfProtectionEnabled ? "Proteção CSRF ATIVADA" : "Proteção CSRF DESATIVADA"}
              sx={{ display: 'block' }}
            />
          </CardContent>
        </Card>

        {/* Simulação de Mudança de Email */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* Versão Vulnerável */}
          <Card sx={{ flex: 1, border: '2px solid #f44336' }}>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                <Warning />
                ❌ Formulário Vulnerável
                <Chip label="SEM PROTEÇÃO" color="error" size="small" />
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Aceita qualquer requisição POST sem verificação:
              </Typography>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Novo Email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  size="small"
                />
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleVulnerableEmailChange}
                  disabled={!newEmail}
                >
                  Alterar Email (Vulnerável)
                </Button>
              </Stack>

              <Alert severity="warning" sx={{ mt: 2 }}>
                ⚠️ Este formulário pode ser explorado por sites maliciosos!
              </Alert>
            </CardContent>
          </Card>

          {/* Versão Segura */}
          <Card sx={{ flex: 1, border: '2px solid #4caf50' }}>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
                <CheckCircle />
                ✅ Formulário Protegido
                <Chip label="COM CSRF TOKEN" color="success" size="small" />
              </Typography>

              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Requer token CSRF válido:
              </Typography>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Novo Email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  size="small"
                />
                
                {csrfToken && (
                  <Box sx={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.8rem', 
                    backgroundColor: '#f3fff3', 
                    p: 1, 
                    borderRadius: 1,
                    border: '1px solid #4caf50'
                  }}>
                    CSRF Token: {csrfToken}
                  </Box>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  onClick={generateCSRFToken}
                  disabled={!!csrfToken}
                >
                  {csrfToken ? 'Token Gerado' : 'Gerar CSRF Token'}
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  onClick={handleSecureEmailChange}
                  disabled={!newEmail || !csrfToken}
                >
                  Alterar Email (Seguro)
                </Button>
              </Stack>

              <Alert severity="success" sx={{ mt: 2 }}>
                🛡️ Protegido contra ataques CSRF!
              </Alert>
            </CardContent>
          </Card>
        </Box>

        {/* Simulação de Ataque */}
        <Card sx={{ border: '2px solid #ff9800' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'warning.main' }}>
              💀 Simulação de Ataque CSRF
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Simula um site malicioso tentando alterar o email do usuário:
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="warning"
                onClick={simulateCSRFAttack}
              >
                🎯 Executar Ataque CSRF
              </Button>
              
              <Typography variant="body2" color="text.secondary">
                {csrfProtectionEnabled 
                  ? "Proteção ativada - ataque será bloqueado" 
                  : "Proteção desativada - ataque será bem-sucedido"
                }
              </Typography>
            </Box>

            {attackExecuted && !csrfProtectionEnabled && (
              <Alert severity="error" sx={{ mt: 2 }}>
                💀 <strong>Ataque bem-sucedido!</strong> O email foi alterado sem consentimento do usuário.
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Código Malicioso */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Code sx={{ mr: 1 }} />
            <Typography variant="h6">Exemplo de Código Malicioso</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="subtitle1" color="error" gutterBottom>
                💀 Como um atacante explora CSRF:
              </Typography>
              <SyntaxHighlighter language="html" style={tomorrow}>
                {maliciousCode}
              </SyntaxHighlighter>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Comparação de Implementação */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Security sx={{ mr: 1 }} />
            <Typography variant="h6">Implementação Segura vs Vulnerável</Typography>
          </AccordionSummary>
          <AccordionDetails>
                         <Stack spacing={3}>
               <Box>
                 <Typography variant="subtitle1" color="error" gutterBottom>
                   ❌ Backend Vulnerável
                 </Typography>
                 <Box sx={{ 
                   '& pre': { 
                     overflow: 'auto !important',
                     maxWidth: '100%',
                     fontSize: '0.85rem !important'
                   }
                 }}>
                   <SyntaxHighlighter 
                     language="javascript" 
                     style={tomorrow}
                     wrapLongLines={true}
                     customStyle={{
                       margin: 0,
                       borderRadius: '8px',
                       fontSize: '0.85rem'
                     }}
                   >
                     {vulnerableCode}
                   </SyntaxHighlighter>
                 </Box>
               </Box>
               <Box>
                 <Typography variant="subtitle1" color="success.main" gutterBottom>
                   ✅ Backend Protegido
                 </Typography>
                 <Box sx={{ 
                   '& pre': { 
                     overflow: 'auto !important',
                     maxWidth: '100%',
                     fontSize: '0.85rem !important'
                   }
                 }}>
                   <SyntaxHighlighter 
                     language="javascript" 
                     style={tomorrow}
                     wrapLongLines={true}
                     customStyle={{
                       margin: 0,
                       borderRadius: '8px',
                       fontSize: '0.85rem'
                     }}
                   >
                     {safeCode}
                   </SyntaxHighlighter>
                 </Box>
               </Box>
               <Box>
                 <Typography variant="subtitle1" gutterBottom>
                   🛡️ Headers de Proteção Adicionais:
                 </Typography>
                 <Box sx={{ 
                   '& pre': { 
                     overflow: 'auto !important',
                     maxWidth: '100%',
                     fontSize: '0.85rem !important'
                   }
                 }}>
                   <SyntaxHighlighter 
                     language="javascript" 
                     style={tomorrow}
                     wrapLongLines={true}
                     customStyle={{
                       margin: 0,
                       borderRadius: '8px',
                       fontSize: '0.85rem'
                     }}
                   >
                     {protectionHeaders}
                   </SyntaxHighlighter>
                 </Box>
               </Box>
             </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Dicas de Prevenção */}
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>🛡️ Como Prevenir CSRF:</Typography>
          <ul>
            <li><strong>CSRF Tokens:</strong> Tokens únicos e imprevisíveis para cada formulário</li>
            <li><strong>SameSite Cookies:</strong> Configure cookies com SameSite=Strict ou Lax</li>
            <li><strong>Verificar Referer:</strong> Validar origem das requisições</li>
            <li><strong>Double Submit Cookies:</strong> Comparar token no header com cookie</li>
            <li><strong>Métodos seguros:</strong> Use GET apenas para operações de leitura</li>
            <li><strong>CORS restritivo:</strong> Configure CORS para domínios específicos</li>
          </ul>
        </Alert>
      </Stack>
    </Box>
  );
};

export default CSRFDemo; 