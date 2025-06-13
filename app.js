const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const CONTEXTO_FUTEBOL = `
Você é um especialista em futebol brasileiro. Responda apenas sobre:
- Times brasileiros e suas histórias
- Jogadores brasileiros famosos
- Campeonatos nacionais (Brasileirão, Copa do Brasil, Estaduais)
- Seleção Brasileira
- Curiosidades do futebol brasileiro
- Estádios brasileiros

Se não for sobre futebol brasileiro, diga que só fala sobre futebol do Brasil.
`;

async function consultarLLM(pergunta) {
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/pierreguillou/gpt2-small-portuguese', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `${CONTEXTO_FUTEBOL}\n\nPergunta: ${pergunta}\nResposta:`,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      return gerarRespostaLocal(pergunta);
    }

    const data = await response.json();
    let resposta = data[0]?.generated_text || '';
    
    resposta = resposta.replace(CONTEXTO_FUTEBOL, '').replace(`Pergunta: ${pergunta}`, '').replace('Resposta:', '').trim();
    
    return resposta || gerarRespostaLocal(pergunta);
  } catch (error) {
    console.log('Usando resposta local devido a erro na API');
    return gerarRespostaLocal(pergunta);
  }
}

function gerarRespostaLocal(pergunta) {
  const perguntaLower = pergunta.toLowerCase();
  
  if (perguntaLower.includes('flamengo')) {
    return '⚫🔴 O Flamengo é o time mais popular do Brasil, fundado em 1895. Tem mais de 40 milhões de torcedores e conquistou a Libertadores em 1981, 2019 e 2022!';
  }
  
  if (perguntaLower.includes('corinthians')) {
    return '⚫⚪ O Corinthians é um dos maiores times do Brasil, fundado em 1910. Conquistou o Mundial de Clubes em 2000 e 2012, além de vários Brasileirões!';
  }
  
  if (perguntaLower.includes('palmeiras')) {
    return '🟢⚪ O Palmeiras é o atual campeão da Libertadores e tem o maior número de títulos nacionais do Brasil. Fundado em 1914, é conhecido como "Verdão"!';
  }
  
  if (perguntaLower.includes('santos')) {
    return '⚪⚫ O Santos é o time que revelou Pelé! Fundado em 1912, conquistou duas Libertadores (1962 e 1963) e é conhecido por revelar grandes talentos!';
  }
  
  if (perguntaLower.includes('pelé') || perguntaLower.includes('pele')) {
    return '👑 Pelé é considerado o maior jogador de todos os tempos! Nascido em 1940, conquistou 3 Copas do Mundo (1958, 1962, 1970) e marcou mais de 1000 gols na carreira!';
  }
  
  if (perguntaLower.includes('ronaldinho')) {
    return '🪄 Ronaldinho Gaúcho foi um dos jogadores mais habilidosos da história! Venceu a Bola de Ouro em 2005 e encantou o mundo com seu futebol alegre e criativo!';
  }
  
  if (perguntaLower.includes('neymar')) {
    return '⭐ Neymar é um dos principais jogadores brasileiros da atualidade! Revelado pelo Santos, hoje joga no Al-Hilal e é artilheiro da Seleção Brasileira!';
  }
  
  if (perguntaLower.includes('seleção') || perguntaLower.includes('selecao') || perguntaLower.includes('brasil')) {
    return '🇧🇷 A Seleção Brasileira é a maior vencedora de Copas do Mundo, com 5 títulos (1958, 1962, 1970, 1994, 2002)! É conhecida como "Canarinho" pela camisa amarela!';
  }
  
  if (perguntaLower.includes('brasileirão') || perguntaLower.includes('brasileiro')) {
    return '🏆 O Campeonato Brasileiro (Brasileirão) é a principal competição nacional, disputada desde 1959. O formato atual com 20 times começou em 2003!';
  }
  
  if (perguntaLower.includes('libertadores')) {
    return '🏆 A Copa Libertadores é o principal torneio sul-americano. Times brasileiros já venceram 23 vezes, sendo os maiores campeões da competição!';
  }
  
  const palavrasFutebol = ['time', 'jogador', 'gol', 'campo', 'bola', 'técnico', 'campeonato', 'copa', 'futebol'];
  const temFutebol = palavrasFutebol.some(palavra => perguntaLower.includes(palavra));
  
  if (!temFutebol) {
    return '⚽ Olá! Eu só falo sobre futebol brasileiro. Pergunte sobre times, jogadores, campeonatos ou curiosidades do nosso futebol!';
  }
  
  return '⚽ Interessante pergunta sobre futebol brasileiro! Infelizmente não tenho informações específicas sobre isso. Pode perguntar sobre times famosos, jogadores ou campeonatos?';
}

// ROTAS

// Chat principal
app.post('/chat', async (req, res) => {
  const { pergunta } = req.body;
  
  if (!pergunta) {
    return res.status(400).json({ erro: 'Pergunta é obrigatória' });
  }
  
  try {
    const resposta = await consultarLLM(pergunta);
    
    res.json({
      pergunta,
      resposta,
      tema: 'futebol_brasileiro'
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao processar pergunta' });
  }
});

// Curiosidades aleatórias
app.get('/curiosidade', (req, res) => {
  const curiosidades = [
    '⚽ O Brasil é o único país que participou de todas as Copas do Mundo!',
    '🏆 O Maracanã já recebeu mais de 200 mil pessoas em uma partida (1950)!',
    '👑 Pelé foi o jogador mais jovem a marcar em uma Copa do Mundo, aos 17 anos!',
    '🌟 O futebol chegou ao Brasil em 1894, trazido por Charles Miller!',
    '🏟️ O Morumbi foi o primeiro estádio do mundo com arquibancadas cobertas!',
    '⚫🔴 O Flamengo tem a maior torcida do mundo, com mais de 40 milhões de fãs!',
    '🇧🇷 O Brasil já produziu 3 dos 4 maiores artilheiros da história das Copas!',
    '⭐ Ronaldinho foi o primeiro brasileiro a ganhar a Bola de Ouro no século 21!'
  ];
  
  const curiosidadeAleatoria = curiosidades[Math.floor(Math.random() * curiosidades.length)];
  
  res.json({
    curiosidade: curiosidadeAleatoria,
    tema: 'futebol_brasileiro'
  });
});

// Times populares
app.get('/times', (req, res) => {
  const times = [
    { nome: 'Flamengo', apelido: 'Mengão', cores: '⚫🔴', fundacao: 1895 },
    { nome: 'Corinthians', apelido: 'Timão', cores: '⚫⚪', fundacao: 1910 },
    { nome: 'Palmeiras', apelido: 'Verdão', cores: '🟢⚪', fundacao: 1914 },
    { nome: 'Santos', apelido: 'Peixe', cores: '⚪⚫', fundacao: 1912 },
    { nome: 'São Paulo', apelido: 'Tricolor', cores: '🔴⚫⚪', fundacao: 1930 },
    { nome: 'Vasco', apelido: 'Gigante da Colina', cores: '⚫⚪', fundacao: 1898 }
  ];
  
  res.json({
    times,
    total: times.length,
    tema: 'futebol_brasileiro'
  });
});

// Status
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    servico: 'Chatbot Futebol Brasileiro',
    endpoints: ['/chat', '/curiosidade', '/times', '/status']
  });
});

// Página inicial
app.get('/', (req, res) => {
  res.json({
    mensagem: '⚽ Bem-vindo ao Chatbot de Futebol Brasileiro!',
    como_usar: {
      chat: 'POST /chat com {"pergunta": "sua pergunta"}',
      curiosidade: 'GET /curiosidade',
      times: 'GET /times',
      status: 'GET /status'
    },
    exemplos: [
      'Conte sobre o Flamengo',
      'Quem é Pelé?',
      'Quantas Copas o Brasil ganhou?',
      'O que é o Brasileirão?'
    ]
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`⚽ Servidor rodando em http://localhost:${PORT}`);
  console.log('📱 Endpoints disponíveis:');
  console.log('   POST /chat - Conversar sobre futebol');
  console.log('   GET /curiosidade - Curiosidade aleatória');
  console.log('   GET /times - Lista de times populares');
  console.log('   GET /status - Status da API');
});

module.exports = app;