document.addEventListener('DOMContentLoaded', function() {
  const translateBtn = document.getElementById('translateBtn');
  const inputText = document.getElementById('inputText');
  const outputText = document.getElementById('outputText');

  translateBtn.addEventListener('click', async function() {
    const text = inputText.value;
    try {
      const translatedText = await translateText(text);
      outputText.value = translatedText;
    } catch (error) {
      outputText.value = `Translation error: ${error.message}`;
    }
  });

  async function translateText(text) {
    // Split the text into parts outside and inside quotes
    const parts = splitTextByQuotes(text);
    
    // Translate only the non-quote parts
    const translatedParts = await Promise.all(parts.map(async (part) => {
      if (part.type === 'text') {
        return await translateWithGoogleTranslate(part.content);
      }
      return part.content;
    }));
    
    // Reconstruct the text
    return reconstructText(parts, translatedParts);
  }

  function splitTextByQuotes(text) {
    const parts = [];
    let currentPart = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      if (text[i] === '"') {
        // If we were building a text part, add it
        if (currentPart && !inQuotes) {
          parts.push({ type: 'text', content: currentPart });
          currentPart = '';
        }
        
        // Start or end quote section
        inQuotes = !inQuotes;
        currentPart += text[i];
      } else {
        currentPart += text[i];
      }

      // If we're at the end and have a current part
      if (i === text.length - 1 && currentPart) {
        parts.push({ 
          type: inQuotes ? 'quote' : 'text', 
          content: currentPart 
        });
      }
    }

    return parts;
  }

  function reconstructText(originalParts, translatedParts) {
    return translatedParts.map(part => part).join('');
  }

  async function translateWithGoogleTranslate(text) {
    // Note: In a real implementation, you'd use a translation API
    // This is a mock implementation
    const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You would replace this with your actual Google Cloud API key
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      body: JSON.stringify({
        q: text,
        source: 'fr',
        target: 'en',
        format: 'text'
      })
    });

    if (!response.ok) {
      throw new Error('Translation failed');
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
  }
});
