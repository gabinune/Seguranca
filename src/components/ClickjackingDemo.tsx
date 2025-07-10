import React, { useState } from 'react';
import {
  Typography,
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
import { ExpandMore, Warning, Code, Visibility, Block } from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ClickjackingDemo: React.FC = () => {
  const [frameProtectionEnabled, setFrameProtectionEnabled] = useState(false);
  const [showClickjackingDemo, setShowClickjackingDemo] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [maliciousClickCount, setMaliciousClickCount] = useState(0);

  const handleLegitimateClick = () => {
    setClickCount(prev => prev + 1);
    alert('Ação legítima executada! ✅');
  };

  const handleMaliciousClick = () => {
    setMaliciousClickCount(prev => prev + 1);
    alert('💀 Ação maliciosa executada sem o conhecimento do usuário!');
  };

  const vulnerableHeadersCode = `// ❌ VULNERÁVEL - Sem proteção contra frames
// Nenhum header de proteção configurado
app.get('/', (req, res) => {
  res.send('<html>...</html>');
  // Qualquer site pode colocar esta página em iframe!
});

// Ou pior ainda - explicitamente permitindo frames
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOWALL'); // NUNCA faça isso!
  next();
});`;

  const safeHeadersCode = `// ✅ SEGURO - Headers de proteção contra clickjacking
app.use((req, res, next) => {
  // Método 1: X-Frame-Options (legado, mas ainda efetivo)
  res.setHeader('X-Frame-Options', 'DENY'); // Bloqueia todos os frames
  // ou
  res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Apenas same-origin
  
  // Método 2: Content Security Policy (moderno e mais flexível)
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'"); // Bloqueia todos
  // ou
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self'"); // Apenas same-origin
  // ou
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://trusted.com");
  
  next();
});

// Para aplicações React/SPA
app.use(helmet({
  frameguard: { action: 'deny' }, // ou 'sameorigin'
  contentSecurityPolicy: {
    directives: {
      frameAncestors: ["'none'"] // ou ["'self'"]
    }
  }
}));`;

  const attackCodeHTML = `<!-- Site malicioso (evil.com) -->
<!DOCTYPE html>
<html>
<head>
  <title>Ganhe dinheiro rápido!</title>
  <style>
    .overlay-container {
      position: relative;
      width: 400px;
      height: 300px;
      margin: 50px auto;
    }
    
    .malicious-iframe {
      position: absolute;
      width: 400px;
      height: 300px;
      opacity: 0.1; /* Quase invisível */
      z-index: 2;
    }
    
    .fake-button {
      position: absolute;
      top: 100px;
      left: 150px;
      width: 100px;
      height: 40px;
      background: #4CAF50;
      color: white;
      border: none;
      cursor: pointer;
      z-index: 1;
    }
  </style>
</head>
<body>
  <h1>🎁 Clique para ganhar $1000!</h1>
  
  <div class="overlay-container">
    <!-- Iframe invisível da vítima por cima do botão falso -->
    <iframe src="https://victim-bank.com/transfer" 
            class="malicious-iframe"></iframe>
    
    <!-- Botão falso que o usuário pensa que está clicando -->
    <button class="fake-button">Clique aqui!</button>
  </div>
</body>
</html>`;

  const javascriptDefenseCode = `// Proteção adicional via JavaScript (frame busting)
// No topo da sua página:
if (window.top !== window.self) {
  // Esta página está sendo carregada em um frame
  window.top.location = window.self.location;
}

// Versão mais robusta
(function() {
  if (window !== window.top) {
    try {
      // Tentar acessar o parent (falha se cross-origin)
      if (window.parent.location.hostname !== window.location.hostname) {
        throw new Error('Clickjacking detected');
      }
    } catch (e) {
      // Redirecionar para sair do frame
      window.top.location.href = window.location.href;
    }
  }
})();

// Para aplicações modernas, prefira headers HTTP
// Este método pode ser contornado por atacantes`;

  const cspExamplesCode = `// Exemplos de Content Security Policy para frames

// 1. Bloquear todos os frames
Content-Security-Policy: frame-ancestors 'none'

// 2. Permitir apenas same-origin
Content-Security-Policy: frame-ancestors 'self'

// 3. Permitir origens específicas
Content-Security-Policy: frame-ancestors 'self' https://trusted.com https://partner.com

// 4. Combinar com outras diretivas
Content-Security-Policy: 
  default-src 'self'; 
  frame-ancestors 'none'; 
  script-src 'self' 'unsafe-inline'

// 5. Para desenvolvimento (permitir localhost)
Content-Security-Policy: frame-ancestors 'self' http://localhost:3000 https://localhost:3000`;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Visibility color="error" />
        Clickjacking
      </Typography>

      <Alert severity="error" sx={{ mb: 3 }}>
        <strong>O que é Clickjacking?</strong><br />
        Clickjacking engana usuários para clicarem em elementos ocultos ou disfarçados. 
        O atacante sobrepõe conteúdo invisível sobre botões legítimos, fazendo o usuário 
        executar ações não intencionais como transferências bancárias, alteração de configurações, 
        ou compartilhamento de dados.
      </Alert>

      <Stack spacing={3}>
        {/* Configuração de Proteção */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🛡️ Configuração de Proteção
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={frameProtectionEnabled}
                  onChange={(e) => setFrameProtectionEnabled(e.target.checked)}
                />
              }
              label={frameProtectionEnabled ? "X-Frame-Options: DENY (Protegido)" : "Sem proteção (Vulnerável)"}
              sx={{ display: 'block', mb: 2 }}
            />

            <Box sx={{ 
              p: 2, 
              backgroundColor: frameProtectionEnabled ? '#f3fff3' : '#fff3f3', 
              borderRadius: 1,
              border: `1px solid ${frameProtectionEnabled ? '#4caf50' : '#f44336'}`
            }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {frameProtectionEnabled 
                  ? 'X-Frame-Options: DENY\nContent-Security-Policy: frame-ancestors \'none\''
                  : 'Nenhum header de proteção configurado'
                }
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Simulação de Clickjacking */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎭 Simulação de Ataque Clickjacking
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 2 }}>
              Esta simulação mostra como um atacante pode sobrepor elementos invisíveis 
              para enganar usuários. Em um ataque real, o usuário não saberia que está 
              clicando no elemento errado.
            </Alert>

            <FormControlLabel
              control={
                <Switch
                  checked={showClickjackingDemo}
                  onChange={(e) => setShowClickjackingDemo(e.target.checked)}
                />
              }
              label="Mostrar simulação de ataque"
              sx={{ display: 'block', mb: 2 }}
            />

            {showClickjackingDemo && (
              <Box sx={{ position: 'relative', height: 200, border: '2px dashed #ff9800', borderRadius: 1, overflow: 'hidden' }}>
                {/* Botão legítimo visível */}
                <Button
                  variant="contained"
                  color="success"
                  sx={{
                    position: 'absolute',
                    top: 80,
                    left: 50,
                    zIndex: frameProtectionEnabled ? 2 : 1
                  }}
                  onClick={handleLegitimateClick}
                >
                  Ação Legítima
                </Button>

                {/* Botão malicioso sobreposto (invisível em ataque real) */}
                {!frameProtectionEnabled && (
                  <Button
                    variant="contained"
                    color="error"
                    sx={{
                      position: 'absolute',
                      top: 80,
                      left: 50,
                      zIndex: 2,
                      opacity: 0.3, // Em um ataque real seria 0
                      backgroundColor: '#f44336'
                    }}
                    onClick={handleMaliciousClick}
                  >
                    Ação Maliciosa
                  </Button>
                )}

                <Typography 
                  variant="caption" 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 10, 
                    left: 10, 
                    color: 'text.secondary' 
                  }}
                >
                  {frameProtectionEnabled 
                    ? "🛡️ Proteção ativa - overlay bloqueado" 
                    : "⚠️ Vulnerável - botão malicioso sobreposto (parcialmente visível para demonstração)"
                  }
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={`Cliques legítimos: ${clickCount}`} 
                color="success" 
                variant="outlined" 
              />
              <Chip 
                label={`Cliques maliciosos: ${maliciousClickCount}`} 
                color="error" 
                variant="outlined" 
              />
            </Box>
          </CardContent>
        </Card>

        {/* Tipos de Ataques Clickjacking */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎯 Tipos de Ataques Clickjacking
            </Typography>
            
            <Stack spacing={2}>
              <Alert severity="error">
                <strong>🏦 Clickjacking Bancário:</strong> Sobrepor iframe de banco sobre botão "Ganhe dinheiro", 
                fazendo usuário transferir dinheiro sem saber.
              </Alert>
              
              <Alert severity="error">
                <strong>📱 Hijack de Webcam:</strong> Overlay invisível sobre botão de permissão de câmera 
                em site legítimo, ativando webcam secretamente.
              </Alert>
              
              <Alert severity="error">
                <strong>🔗 Likejacking:</strong> Fazer usuários curtirem páginas no Facebook sem conhecimento, 
                usando iframe invisível sobre conteúdo atrativo.
              </Alert>
              
              <Alert severity="error">
                <strong>⚙️ Configurações maliciosas:</strong> Alterar configurações de privacidade ou 
                segurança em redes sociais através de overlays.
              </Alert>
            </Stack>
          </CardContent>
        </Card>

        {/* Exemplo de Código Malicioso */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Warning sx={{ mr: 1, color: 'error.main' }} />
            <Typography variant="h6">Exemplo de Site Malicioso</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="subtitle1" color="error" gutterBottom>
              💀 Como um atacante cria uma página clickjacking:
            </Typography>
                         <Box sx={{ 
               '& pre': { 
                 overflow: 'auto !important',
                 maxWidth: '100%',
                 fontSize: '0.85rem !important'
               }
             }}>
               <SyntaxHighlighter 
                 language="html" 
                 style={tomorrow}
                 wrapLongLines={true}
                 customStyle={{
                   margin: 0,
                   borderRadius: '8px',
                   fontSize: '0.85rem'
                 }}
               >
                 {attackCodeHTML}
               </SyntaxHighlighter>
             </Box>
          </AccordionDetails>
        </Accordion>

        {/* Headers de Proteção */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Block sx={{ mr: 1 }} />
            <Typography variant="h6">Headers de Proteção</Typography>
          </AccordionSummary>
          <AccordionDetails>
                         <Stack spacing={3}>
               <Box>
                 <Typography variant="subtitle1" color="error" gutterBottom>
                   ❌ Servidor Vulnerável
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
                     {vulnerableHeadersCode}
                   </SyntaxHighlighter>
                 </Box>
               </Box>
               <Box>
                 <Typography variant="subtitle1" color="success.main" gutterBottom>
                   ✅ Servidor Protegido
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
                     {safeHeadersCode}
                   </SyntaxHighlighter>
                 </Box>
               </Box>
             </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Content Security Policy */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Code sx={{ mr: 1 }} />
            <Typography variant="h6">Content Security Policy Examples</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" gutterBottom>
              CSP oferece controle mais granular sobre onde sua página pode ser incorporada:
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
                 {cspExamplesCode}
               </SyntaxHighlighter>
             </Box>
          </AccordionDetails>
        </Accordion>

        {/* Frame Busting JavaScript */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Code sx={{ mr: 1 }} />
            <Typography variant="h6">Proteção JavaScript (Frame Busting)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="warning" sx={{ mb: 2 }}>
              ⚠️ JavaScript pode ser desabilitado ou contornado. Sempre use headers HTTP como proteção principal.
            </Alert>
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
                 {javascriptDefenseCode}
               </SyntaxHighlighter>
             </Box>
          </AccordionDetails>
        </Accordion>

        {/* Comparação de Métodos */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Comparação de Métodos de Proteção
            </Typography>
            
                         <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', lg: 'row' } }}>
              <Card sx={{ flex: 1, border: '1px solid #2196f3' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ color: '#2196f3', mb: 1 }}>
                    X-Frame-Options
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    ✅ Suporte universal<br/>
                    ✅ Simples de implementar<br/>
                    ❌ Limitado (apenas 3 opções)<br/>
                    ❌ Legado
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ flex: 1, border: '1px solid #4caf50' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ color: '#4caf50', mb: 1 }}>
                    Content Security Policy
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    ✅ Muito flexível<br/>
                    ✅ Moderno<br/>
                    ✅ Múltiplas proteções<br/>
                    ❌ Mais complexo
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ flex: 1, border: '1px solid #ff9800' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ color: '#ff9800', mb: 1 }}>
                    JavaScript Frame Busting
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    ❌ Pode ser desabilitado<br/>
                    ❌ Contornável<br/>
                    ❌ Não confiável<br/>
                    ✅ Fallback útil
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </CardContent>
        </Card>

        {/* Dicas de Prevenção */}
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>🛡️ Como Prevenir Clickjacking:</Typography>
          <ul>
            <li><strong>X-Frame-Options: DENY:</strong> Bloqueia todos os frames (mais restritivo)</li>
            <li><strong>X-Frame-Options: SAMEORIGIN:</strong> Permite apenas same-origin</li>
            <li><strong>CSP frame-ancestors:</strong> Controle granular de origens permitidas</li>
            <li><strong>Use HTTPS:</strong> Evita ataques man-in-the-middle nos headers</li>
            <li><strong>Teste regularmente:</strong> Verifique se headers estão sendo enviados</li>
            <li><strong>Frame busting como backup:</strong> JavaScript adicional, mas não principal</li>
            <li><strong>Educação do usuário:</strong> Ensine sobre URLs suspeitas e phishing</li>
          </ul>
        </Alert>
      </Stack>
    </Box>
  );
};

export default ClickjackingDemo; 