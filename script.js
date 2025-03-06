document.addEventListener('DOMContentLoaded', function () {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatMessages = document.getElementById('chat-messages');
  const suggestionBtns = document.querySelectorAll('.suggestion-btn');
  
  // Clé API Gemini
  const API_KEY = "AIzaSyB2LJHxmR72BY4kmy-3IE3VGQH6s6yGtXU";
  
  // Nombre maximal de mots dans la réponse du bot
  const MAX_WORDS = 50;
  
  // Gestion des boutons de suggestion
  suggestionBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      userInput.value = this.textContent;
      sendMessage(this.textContent);
    });
  });
  
  // Gestion du formulaire
  chatForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const message = userInput.value.trim();
    if (message) {
      sendMessage(message);
    }
  });
  
  // Fonction pour envoyer un message
  function sendMessage(message) {
    // Afficher le message utilisateur
    const userDiv = document.createElement('div');
    userDiv.className = 'message user-message';
    userDiv.innerHTML = `<div class="message-content">${message}</div>`;
    chatMessages.appendChild(userDiv);
    
    // Vider l'input
    userInput.value = '';
    
    // Afficher un indicateur de chargement
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.innerHTML = `<div class="message-content">Reflexion</div>`;
    chatMessages.appendChild(loadingDiv);
    
    // Défiler vers le bas
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Appeler l'API Gemini
    fetchGeminiResponse(message)
      .then(response => {
        // Supprimer l'indicateur de chargement
        chatMessages.removeChild(loadingDiv);
        
        // Limiter la réponse à un certain nombre de mots
        const limitedResponse = limitWords(response, MAX_WORDS);
        
        // Formater le texte avec des balises HTML (gras, italique)
        const formattedResponse = formatText(limitedResponse);
        
        // Afficher la réponse de l'API formatée
        const botDiv = document.createElement('div');
        botDiv.className = 'message bot-message';
        botDiv.innerHTML = `<div class="message-content">${formattedResponse}</div>`;
        chatMessages.appendChild(botDiv);
        
        // Défiler vers le bas
        chatMessages.scrollTop = chatMessages.scrollHeight;
      })
      .catch(error => {
        // Supprimer l'indicateur de chargement
        chatMessages.removeChild(loadingDiv);
        
        // Afficher un message d'erreur
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message bot-message';
        errorDiv.innerHTML = `<div class="message-content">Désolé, une erreur s'est produite. Veuillez réessayer.</div>`;
        chatMessages.appendChild(errorDiv);
        
        console.error('Erreur API:', error);
      });
  }
  
  // Fonction pour appeler l'API Gemini
  async function fetchGeminiResponse(message) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    // Construction du prompt spécialisé pour la création de contenu sur les réseaux sociaux
    const socialMediaContentContext = `Tu es ContentBot, un assistant spécialisé en création de contenu pour les réseaux sociaux.
    Tu dois fournir des conseils pratiques, créatifs et efficaces pour :
    - La création de posts engageants
    - L'optimisation des visuels pour chaque plateforme (Instagram, Twitter, TikTok, etc.)
    - La rédaction de légendes captivantes
    - L'utilisation des hashtags et tendances pour maximiser la portée
    - La stratégie de publication et la fréquence idéale
    - Les bonnes pratiques pour attirer une audience et la fidéliser
    
    Si la question n'est pas liée à la création de contenu sur les réseaux sociaux, rappelle poliment que tu es spécialisé dans ce domaine.
    Sois concis et pratique dans tes réponses.`;
    
    const data = {
      contents: [
        {
          parts: [
            { text: socialMediaContentContext },
            { text: message }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500
      }
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    // Extraire et retourner la réponse du modèle
    return result.candidates[0].content.parts[0].text;
  }
  
  // Fonction pour limiter la réponse en nombre de mots
  function limitWords(text, maxWords) {
    const words = text.split(/\s+/); // Diviser le texte en mots
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + ''; // Limiter et ajouter des "..."
    }
    return text;
  }

  // Fonction pour formater le texte en remplaçant les astérisques par des balises HTML
  function formatText(text) {
    // Remplacer **par** <strong> pour le gras
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Remplacer *par* <em> pour l'italique
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return text;
  }
});
