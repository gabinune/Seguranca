import React, { useState, useEffect } from 'react';
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
import { ExpandMore, Warning, Code, Storage, Lock } from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const DataExposureDemo: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [useSecureStorage, setUseSecureStorage] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Simular login
  const handleLogin = () => {
    if (username && password) {
      const fakeToken = `jwt.${btoa(JSON.stringify({
        sub: username,
        exp: Date.now() + 3600000,
        role: 'user'
      }))}.signature`;
      
      setToken(fakeToken);
      setIsLoggedIn(true);
      
      if (useSecureStorage) {
        // Simulando armazenamento seguro (na prática seria httpOnly cookie)
        console.log('Token armazenado em httpOnly cookie (seguro)');
      } else {
        // VULNERÁVEL - localStorage
        localStorage.setItem('authToken', fakeToken);
        console.log('Token armazenado em localStorage (VULNERÁVEL!)');
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken('');
    localStorage.removeItem('authToken');
  };

  // Verificar localStorage no carregamento
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken && !useSecureStorage) {
      setToken(storedToken);
      setIsLoggedIn(true);
    }
  }, [useSecureStorage]);

  const vulnerableCode = `// ❌ VULNERÁVEL - Token em localStorage
function login(credentials) {
  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  
  const { token } = await response.json();
  
  // PROBLEMA: Acessível via JavaScript!
  localStorage.setItem('authToken', token);
  
  // Qualquer script XSS pode acessar:
  // const stolenToken = localStorage.getItem('authToken');
}

// Enviando token em requests
fetch('/api/protected', {
  headers: {
    'Authorization': \`Bearer \${localStorage.getItem('authToken')}\`
  }
});`;

  const safeCode = `// ✅ SEGURO - HttpOnly Cookies
function login(credentials) {
  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    credentials: 'include' // Incluir cookies
  });
  
  // Backend define cookie httpOnly:
  // Set-Cookie: authToken=jwt...; HttpOnly; Secure; SameSite=Strict
  
  // Token não acessível via JavaScript!
  // localStorage/sessionStorage não usado para dados sensíveis
}

// Cookies são enviados automaticamente
fetch('/api/protected', {
  credentials: 'include' // Cookies incluídos automaticamente
});`;

  const getCurrentStorage = () => {
    const storage = { ...localStorage };
    return Object.keys(storage).length > 0 ? storage : { '(vazio)': 'Nenhum dado armazenado' };
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Storage color="error" />
        Exposição de Dados Sensíveis
      </Typography>

      <Alert severity="error" sx={{ mb: 3 }}>
        <strong>O Problema:</strong><br />
        Armazenar dados sensíveis como tokens JWT em localStorage/sessionStorage os torna acessíveis 
        a qualquer script JavaScript, incluindo ataques XSS. Isso pode levar ao roubo de sessões 
        e comprometimento total da conta do usuário.
      </Alert>

      <Stack spacing={3}>
        {/* Configuração de Teste */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🧪 Simulação de Login
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={useSecureStorage}
                  onChange={(e) => setUseSecureStorage(e.target.checked)}
                  disabled={isLoggedIn}
                />
              }
              label={useSecureStorage ? "Armazenamento Seguro (httpOnly cookie)" : "Armazenamento Vulnerável (localStorage)"}
              sx={{ mb: 2, display: 'block' }}
            />

            {!isLoggedIn ? (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'end', flexWrap: 'wrap' }}>
                <TextField
                  label="Usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  size="small"
                />
                <TextField
                  label="Senha"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleLogin}
                  disabled={!username || !password}
                >
                  Login
                </Button>
              </Box>
            ) : (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  ✅ Usuário logado: {username}
                </Alert>
                <Button variant="outlined" onClick={handleLogout}>
                  Logout
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Comparação de Armazenamento */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* localStorage (Vulnerável) */}
          <Card sx={{ flex: 1, border: '2px solid #f44336' }}>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                <Warning />
                ❌ localStorage (Vulnerável)
                <Chip label="PERIGOSO" color="error" size="small" />
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Conteúdo atual do localStorage:
              </Typography>

              <Box sx={{ 
                border: '1px solid #f44336', 
                borderRadius: 1, 
                p: 2, 
                backgroundColor: '#fff3f3',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                maxHeight: 200,
                overflow: 'auto'
              }}>
                <pre>{JSON.stringify(getCurrentStorage(), null, 2)}</pre>
              </Box>

              <Alert severity="warning" sx={{ mt: 2 }}>
                💀 Qualquer script pode acessar:<br/>
                <code>localStorage.getItem('authToken')</code>
              </Alert>
            </CardContent>
          </Card>

          {/* httpOnly Cookies (Seguro) */}
          <Card sx={{ flex: 1, border: '2px solid #4caf50' }}>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
                <Lock />
                ✅ httpOnly Cookies (Seguro)
                <Chip label="SEGURO" color="success" size="small" />
              </Typography>

              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Cookies seguros (não acessíveis via JS):
              </Typography>

              <Box sx={{ 
                border: '1px solid #4caf50', 
                borderRadius: 1, 
                p: 2, 
                backgroundColor: '#f3fff3',
                fontFamily: 'monospace',
                fontSize: '0.8rem'
              }}>
                {useSecureStorage && isLoggedIn ? (
                  <div>
                    Set-Cookie: authToken={token.substring(0, 20)}...<br/>
                    HttpOnly; Secure; SameSite=Strict
                  </div>
                ) : (
                  <div style={{ color: '#666' }}>
                    Nenhum cookie httpOnly definido
                  </div>
                )}
              </Box>

              <Alert severity="success" sx={{ mt: 2 }}>
                🛡️ JavaScript NÃO pode acessar<br/>
                Enviado automaticamente pelo browser
              </Alert>
            </CardContent>
          </Card>
        </Box>

        {/* Token Atual */}
        {token && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔍 Token JWT Atual (apenas para demonstração)
              </Typography>
              <Box sx={{ 
                fontFamily: 'monospace', 
                fontSize: '0.8rem', 
                backgroundColor: '#f5f5f5', 
                p: 2, 
                borderRadius: 1,
                wordBreak: 'break-all'
              }}>
                {token}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Em produção, este token conteria informações do usuário e seria válido por tempo limitado.
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Demonstração de Script Malicioso */}
        <Card sx={{ border: '2px solid #ff9800' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'warning.main' }}>
              ⚠️ Simulação de Ataque XSS
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Execute este código no console do navegador para ver como é fácil roubar dados do localStorage:
            </Typography>
            <Box sx={{ 
              fontFamily: 'monospace', 
              backgroundColor: '#fff3e0', 
              p: 2, 
              borderRadius: 1,
              border: '1px solid #ff9800'
            }}>
              console.log('Dados roubados:', localStorage.getItem('authToken'));
            </Box>
          </CardContent>
        </Card>

        {/* Exemplos de Código */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Code sx={{ mr: 1 }} />
            <Typography variant="h6">Código - Implementação Segura</Typography>
          </AccordionSummary>
          <AccordionDetails>
                         <Stack spacing={3}>
               <Box>
                 <Typography variant="subtitle1" color="error" gutterBottom>
                   ❌ Código Vulnerável
                 </Typography>
                 <Box sx={{ 
                   '& pre': { 
                     overflow: 'auto !important',
                     maxWidth: '100%',
                     fontSize: '0.85rem !important'
                   }
                 }}>
                   <SyntaxHighlighter 
                     language="typescript" 
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
                   ✅ Código Seguro
                 </Typography>
                 <Box sx={{ 
                   '& pre': { 
                     overflow: 'auto !important',
                     maxWidth: '100%',
                     fontSize: '0.85rem !important'
                   }
                 }}>
                   <SyntaxHighlighter 
                     language="typescript" 
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
             </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Dicas de Prevenção */}
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>🛡️ Práticas Seguras para Autenticação:</Typography>
          <ul>
            <li><strong>Use httpOnly cookies:</strong> Impedem acesso via JavaScript</li>
            <li><strong>Secure flag:</strong> Cookies só enviados via HTTPS</li>
            <li><strong>SameSite=Strict:</strong> Previne ataques CSRF</li>
            <li><strong>Expire tokens:</strong> Defina tempo de vida curto</li>
            <li><strong>Refresh tokens:</strong> Use tokens de renovação seguros</li>
            <li><strong>NUNCA armazene:</strong> Senhas, tokens, ou dados sensíveis em localStorage</li>
          </ul>
        </Alert>
      </Stack>
    </Box>
  );
};

export default DataExposureDemo; 