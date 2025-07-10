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
  AccordionDetails
} from '@mui/material';
import { ExpandMore, Warning, CheckCircle, Code } from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import DOMPurify from 'dompurify';

const XSSDemo: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [showVulnerable, setShowVulnerable] = useState(false);
  const [showSafe, setShowSafe] = useState(false);

  // Exemplo de input malicioso
  const maliciousExample = `<img src="x" onerror="alert('XSS Vulnerability! 🚨')" />`;
  const scriptExample = `<script>alert('XSS Attack!');</script>Hello`;

  const vulnerableCode = `// ❌ VULNERÁVEL - dangerouslySetInnerHTML
function VulnerableComponent({ userInput }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: userInput }} />
  );
}`;

  const safeCode = `// ✅ SEGURO - Sanitização com DOMPurify
import DOMPurify from 'dompurify';

function SafeComponent({ userInput }) {
  const cleanHTML = DOMPurify.sanitize(userInput);
  return (
    <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />
  );
  
  // Ou melhor ainda, evite innerHTML completamente:
  return <div>{userInput}</div>; // React escapa automaticamente
}`;

  const handleMaliciousExample = () => {
    setUserInput(maliciousExample);
  };

  const handleScriptExample = () => {
    setUserInput(scriptExample);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning color="error" />
        XSS - Cross-Site Scripting
      </Typography>

      <Alert severity="error" sx={{ mb: 3 }}>
        <strong>O que é XSS?</strong><br />
        XSS permite que atacantes injetem scripts maliciosos em páginas web visualizadas por outros usuários.
        Isso pode levar ao roubo de cookies, sequestro de sessões, redirecionamentos maliciosos e muito mais.
      </Alert>

      <Stack spacing={3}>
        {/* Input do usuário */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🧪 Teste de XSS
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Digite seu HTML (tente os exemplos abaixo)"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleMaliciousExample}
              >
                Teste: IMG com onerror
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleScriptExample}
              >
                Teste: Script Tag
              </Button>
              <Button
                variant="outlined"
                color="warning"
                size="small"
                onClick={() => setUserInput('<b>HTML normal</b>')}
              >
                Teste: HTML Seguro
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Comparação lado a lado */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* Versão Vulnerável */}
          <Card sx={{ flex: 1, border: '2px solid #f44336' }}>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                <Warning />
                ❌ Versão Vulnerável
                <Chip label="PERIGOSO" color="error" size="small" />
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Usando dangerouslySetInnerHTML sem sanitização:
              </Typography>

              <Button
                variant="contained"
                color="error"
                onClick={() => setShowVulnerable(!showVulnerable)}
                sx={{ mb: 2 }}
              >
                {showVulnerable ? 'Ocultar' : 'Executar'} Código Vulnerável
              </Button>

              {showVulnerable && (
                <Box sx={{ 
                  border: '1px solid #f44336', 
                  borderRadius: 1, 
                  p: 2, 
                  backgroundColor: '#fff3f3',
                  minHeight: 60
                }}>
                  <Typography variant="caption" color="error" sx={{ mb: 1, display: 'block' }}>
                    Saída vulnerável (XSS executado):
                  </Typography>
                  {/* VULNERÁVEL - NÃO FAZER ISSO EM PRODUÇÃO! */}
                  <div dangerouslySetInnerHTML={{ __html: userInput }} />
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Versão Segura */}
          <Card sx={{ flex: 1, border: '2px solid #4caf50' }}>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
                <CheckCircle />
                ✅ Versão Segura
                <Chip label="SEGURO" color="success" size="small" />
              </Typography>

              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Usando DOMPurify para sanitização:
              </Typography>

              <Button
                variant="contained"
                color="success"
                onClick={() => setShowSafe(!showSafe)}
                sx={{ mb: 2 }}
              >
                {showSafe ? 'Ocultar' : 'Executar'} Código Seguro
              </Button>

              {showSafe && (
                <Box sx={{ 
                  border: '1px solid #4caf50', 
                  borderRadius: 1, 
                  p: 2, 
                  backgroundColor: '#f3fff3',
                  minHeight: 60
                }}>
                  <Typography variant="caption" color="success.main" sx={{ mb: 1, display: 'block' }}>
                    Saída segura (XSS removido):
                  </Typography>
                  {/* SEGURO - Scripts maliciosos são removidos */}
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Exemplos de Código */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Code sx={{ mr: 1 }} />
            <Typography variant="h6">Código - Como Implementar</Typography>
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
          <Typography variant="h6" gutterBottom>🛡️ Como Prevenir XSS:</Typography>
          <ul>
            <li><strong>Evite dangerouslySetInnerHTML:</strong> Use texto simples quando possível</li>
            <li><strong>Sanitize HTML:</strong> Use bibliotecas como DOMPurify quando precisar de HTML</li>
            <li><strong>Content Security Policy (CSP):</strong> Configure headers para bloquear scripts inline</li>
            <li><strong>Validação de entrada:</strong> Valide e escape inputs do usuário no backend</li>
            <li><strong>HttpOnly cookies:</strong> Impeça acesso via JavaScript aos cookies de sessão</li>
          </ul>
        </Alert>
      </Stack>
    </Box>
  );
};

export default XSSDemo; 