# StrAId - Configuration d'Ollama

StrAId utilise Ollama pour exécuter des modèles de langage localement sur votre machine. Voici comment le configurer.

## Installation d'Ollama

### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### macOS
```bash
brew install ollama
```

### Windows
Téléchargez l'installateur depuis https://ollama.com/download

## Démarrage d'Ollama

Après l'installation, démarrez le service Ollama :

```bash
ollama serve
```

Le service démarre sur `http://localhost:11434` par défaut.

## Téléchargement des modèles

StrAId supporte 5 modèles différents. Vous pouvez les télécharger via l'interface Settings ou en ligne de commande :

### Via l'interface StrydDash
1. Allez dans **Settings**
2. Dans la section **AI Model**, sélectionnez le modèle souhaité
3. Si le modèle n'est pas téléchargé, il sera automatiquement téléchargé via Ollama

### Via la ligne de commande
```bash
# Modèle par défaut (recommandé pour commencer)
ollama pull ministral-3b

# Autres modèles disponibles
ollama pull llama3.1:8b
ollama pull phi3.5
ollama pull mistral-nemo
ollama pull ministral-8b
```

## Utilisation

Une fois Ollama démarré et un modèle téléchargé :

1. Allez dans **Settings** et sélectionnez votre modèle préféré
2. Cliquez sur l'icône **StrAId** dans le menu ou sur le bouton flottant
3. Posez des questions sur vos données d'entraînement !

## Dépannage

### Erreur "Ollama is not running"
- Vérifiez qu'Ollama est démarré : `ollama serve`
- Vérifiez qu'il écoute sur le bon port : `ps aux | grep ollama`

### Erreur "Model needs to be downloaded"
- Téléchargez le modèle via Settings ou avec `ollama pull <model-name>`
- Vérifiez les modèles installés : `ollama list`

### Le téléchargement est lent
- Les modèles peuvent être volumineux (3-8 Go)
- Ministral-3b (3 Go) est le plus rapide à télécharger
- Llama-3.1-8b (4.7 Go) et Ministral-8b (4.9 Go) sont plus gros mais plus performants

## Recommandations de modèles

| Modèle | Taille | RAM requise | Performance | Vitesse |
|--------|--------|-------------|-------------|---------|
| **ministral-3b** | ~3 GB | 4 GB | Bon | Rapide |
| **phi-3.5** | ~2.2 GB | 4 GB | Bon | Très rapide |
| **llama-3.1-8b** | ~4.7 GB | 8 GB | Excellent | Moyen |
| **mistral-nemo** | ~7 GB | 12 GB | Excellent | Lent |
| **ministral-8b** | ~4.9 GB | 8 GB | Excellent | Moyen |

**Pour débuter** : Utilisez `ministral-3b` (modèle par défaut)  
**Pour de meilleures réponses** : Utilisez `llama-3.1-8b` si vous avez 8 GB+ de RAM

## Configuration avancée

### Changer l'URL d'Ollama
Si Ollama est sur un autre port ou serveur distant, créez un fichier `.env.local` :

```bash
OLLAMA_API_URL=http://localhost:11434
```

### Vérifier qu'Ollama fonctionne
```bash
curl http://localhost:11434/api/tags
```

Devrait retourner la liste des modèles installés.
