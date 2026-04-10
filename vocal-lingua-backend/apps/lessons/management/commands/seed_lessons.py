"""
Gabsther — Seed Lessons Management Command
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Usage:
  python manage.py seed_lessons          # Insert only (skip if exists)
  python manage.py seed_lessons --reset  # Delete all lessons and re-seed

Creates:
- 1 French language
- 21 French lessons across 5 categories
"""

from django.core.management.base import BaseCommand
from apps.lessons.models import Language, Lesson


FRENCH_LESSONS = [
    # ─────────────────────────────────────────────────────
    # GREETINGS & INTRODUCTIONS
    # ─────────────────────────────────────────────────────
    {
        "title": "Bonjour ! — Basic Greetings",
        "subtitle": "Say hello and be understood anywhere in France",
        "description": "Learn the essential French greetings for morning, afternoon and evening. Master the difference between formal and informal hellos.",
        "category": "greetings",
        "difficulty": "A1",
        "order": 1,
        "duration_minutes": 8,
        "xp_reward": 10,
        "thumbnail_emoji": "👋",
        "is_free": True,
        "audio_script": "Bonjour. Bonsoir. Salut. Bonne nuit. Bonjour madame. Bonjour monsieur.",
        "scenario_prompt": "You are greeting a French shopkeeper. Practice saying hello, asking how they are, and responding politely.",
        "content": {
            "vocabulary": [
                {"word": "Bonjour", "translation": "Hello / Good morning", "pronunciation": "bohn-ZHOOR"},
                {"word": "Bonsoir", "translation": "Good evening", "pronunciation": "bohn-SWAHR"},
                {"word": "Salut", "translation": "Hi (informal)", "pronunciation": "sah-LUE"},
                {"word": "Bonne nuit", "translation": "Good night", "pronunciation": "bun NWEE"},
                {"word": "Madame", "translation": "Ma'am / Mrs.", "pronunciation": "mah-DAM"},
                {"word": "Monsieur", "translation": "Sir / Mr.", "pronunciation": "muh-SYUH"},
            ],
            "phrases": [
                {"french": "Bonjour !", "english": "Hello! / Good morning!", "usage": "Any time before evening"},
                {"french": "Bonsoir !", "english": "Good evening!", "usage": "After around 6pm"},
                {"french": "Salut !", "english": "Hi! (casual)", "usage": "With friends, peers"},
                {"french": "Bonne nuit !", "english": "Good night!", "usage": "When going to bed"},
                {"french": "Bonjour madame.", "english": "Hello ma'am.", "usage": "Formal greeting"},
            ],
            "grammar_notes": "In French, greetings change based on the time of day AND the formality of the situation. Use 'vous' (formal you) with strangers and elders, 'tu' (informal you) with friends and family.",
            "speaking_prompts": [
                "Greet your friend at school.",
                "Say hello to a shopkeeper in Paris.",
                "Wish someone good night.",
                "Greet your boss at work.",
            ],
            "quiz": [
                {"question": "How do you say 'Good evening' in French?", "options": ["Bonjour", "Bonsoir", "Salut", "Bonne nuit"], "answer": 1},
                {"question": "Which greeting is informal?", "options": ["Bonjour", "Bonsoir", "Salut", "Madame"], "answer": 2},
                {"question": "When do you say 'Bonne nuit'?", "options": ["Morning", "Afternoon", "Evening", "Before sleeping"], "answer": 3},
            ],
        },
    },
    {
        "title": "Se Présenter — Introducing Yourself",
        "subtitle": "Tell people your name, age, and where you're from",
        "description": "Learn how to introduce yourself in French — your name, nationality, profession and where you live.",
        "category": "greetings",
        "difficulty": "A1",
        "order": 2,
        "duration_minutes": 10,
        "xp_reward": 10,
        "thumbnail_emoji": "🙋",
        "is_free": True,
        "audio_script": "Je m'appelle Marie. J'ai vingt-cinq ans. Je suis française. J'habite à Paris. Je suis étudiante.",
        "scenario_prompt": "You're at a French language meetup. Introduce yourself: your name, where you're from, and what you do.",
        "content": {
            "vocabulary": [
                {"word": "Je m'appelle", "translation": "My name is", "pronunciation": "zhuh mah-PELL"},
                {"word": "J'ai ... ans", "translation": "I am ... years old", "pronunciation": "zhay ... ahn"},
                {"word": "Je suis", "translation": "I am", "pronunciation": "zhuh SWEE"},
                {"word": "J'habite", "translation": "I live (in)", "pronunciation": "zhah-BEET"},
                {"word": "étudiant(e)", "translation": "student", "pronunciation": "ay-tue-DYAHN"},
                {"word": "américain(e)", "translation": "American", "pronunciation": "ah-may-ree-KAN"},
            ],
            "phrases": [
                {"french": "Je m'appelle Sophie.", "english": "My name is Sophie."},
                {"french": "J'ai vingt ans.", "english": "I am twenty years old."},
                {"french": "Je suis américaine.", "english": "I am American. (feminine)"},
                {"french": "J'habite à New York.", "english": "I live in New York."},
                {"french": "Je suis professeur.", "english": "I am a teacher."},
                {"french": "Enchanté(e) !", "english": "Nice to meet you!"},
            ],
            "grammar_notes": "In French, adjectives of nationality agree in gender. 'américain' (masc.) → 'américaine' (fem.). The accent on the final 'e' signals the feminine form.",
            "speaking_prompts": [
                "Introduce yourself at a party.",
                "Tell someone your age and city.",
                "Say what your job or study is.",
            ],
            "quiz": [
                {"question": "How do you say 'My name is' in French?", "options": ["Je suis", "J'habite", "Je m'appelle", "J'ai"], "answer": 2},
                {"question": "Fill in: J'___ vingt ans.", "options": ["suis", "ai", "m'appelle", "habite"], "answer": 1},
            ],
        },
    },
    {
        "title": "Au Revoir — Saying Goodbye",
        "subtitle": "All the ways to end a conversation in French",
        "description": "From formal farewells to casual goodbyes — learn how to leave any French conversation gracefully.",
        "category": "greetings",
        "difficulty": "A1",
        "order": 3,
        "duration_minutes": 7,
        "xp_reward": 10,
        "thumbnail_emoji": "👋",
        "is_free": True,
        "audio_script": "Au revoir. À bientôt. À demain. Bonne journée. Bonne soirée. À tout à l'heure.",
        "scenario_prompt": "You're leaving a French café after a conversation. Practice different ways to say goodbye.",
        "content": {
            "vocabulary": [
                {"word": "Au revoir", "translation": "Goodbye", "pronunciation": "oh ruh-VWAHR"},
                {"word": "À bientôt", "translation": "See you soon", "pronunciation": "ah byan-TOH"},
                {"word": "À demain", "translation": "See you tomorrow", "pronunciation": "ah duh-MAN"},
                {"word": "À tout à l'heure", "translation": "See you later (same day)", "pronunciation": "ah too tah LUHR"},
                {"word": "Bonne journée", "translation": "Have a good day", "pronunciation": "bun zhoor-NAY"},
                {"word": "Bonne soirée", "translation": "Have a good evening", "pronunciation": "bun swah-RAY"},
            ],
            "phrases": [
                {"french": "Au revoir !", "english": "Goodbye!"},
                {"french": "À bientôt !", "english": "See you soon!"},
                {"french": "Bonne journée !", "english": "Have a nice day!"},
                {"french": "À demain !", "english": "See you tomorrow!"},
                {"french": "Ciao !", "english": "Bye! (very casual, from Italian)"},
            ],
            "grammar_notes": "'À' + time expression is a common pattern for 'see you at/in...': À lundi (see you Monday), À ce soir (see you tonight).",
            "speaking_prompts": [
                "Say goodbye to a friend after lunch.",
                "Leave a formal meeting — say goodbye formally.",
                "Tell someone you'll see them tomorrow.",
            ],
            "quiz": [
                {"question": "What does 'À bientôt' mean?", "options": ["Goodbye", "See you soon", "Good night", "Have a nice day"], "answer": 1},
                {"question": "Which is more formal?", "options": ["Ciao", "Salut", "Au revoir", "À plus"], "answer": 2},
            ],
        },
    },
    {
        "title": "La Politesse — French Manners",
        "subtitle": "Please, thank you, and the magic words of French culture",
        "description": "French politeness is essential — learn please, thank you, excuse me, and you're welcome. These words will open every door.",
        "category": "greetings",
        "difficulty": "A1",
        "order": 4,
        "duration_minutes": 8,
        "xp_reward": 10,
        "thumbnail_emoji": "🎩",
        "is_free": True,
        "audio_script": "S'il vous plaît. Merci beaucoup. De rien. Excusez-moi. Pardon. Je vous en prie.",
        "scenario_prompt": "You're in a busy Paris street. Practice polite expressions: asking for directions, thanking someone, and apologizing.",
        "content": {
            "vocabulary": [
                {"word": "S'il vous plaît", "translation": "Please (formal)", "pronunciation": "seel voo PLEH"},
                {"word": "S'il te plaît", "translation": "Please (informal)", "pronunciation": "seel tuh PLEH"},
                {"word": "Merci", "translation": "Thank you", "pronunciation": "mair-SEE"},
                {"word": "Merci beaucoup", "translation": "Thank you very much", "pronunciation": "mair-see boh-KOO"},
                {"word": "De rien", "translation": "You're welcome", "pronunciation": "duh RYAN"},
                {"word": "Je vous en prie", "translation": "You're welcome (formal)", "pronunciation": "zhuh voo-zan PREE"},
                {"word": "Excusez-moi", "translation": "Excuse me (formal)", "pronunciation": "ex-kue-zay MWAH"},
                {"word": "Pardon", "translation": "Sorry / Pardon", "pronunciation": "par-DOHN"},
            ],
            "phrases": [
                {"french": "Un café, s'il vous plaît.", "english": "A coffee, please."},
                {"french": "Merci beaucoup !", "english": "Thank you very much!"},
                {"french": "De rien.", "english": "You're welcome. (Don't mention it.)"},
                {"french": "Excusez-moi, où est la gare ?", "english": "Excuse me, where is the train station?"},
                {"french": "Pardon, je suis désolé(e).", "english": "Sorry, I apologize."},
            ],
            "grammar_notes": "French has formal (vous) and informal (tu) forms. 'S'il vous plaît' = formal; 'S'il te plaît' = informal. Always use formal with strangers!",
            "speaking_prompts": [
                "Order something at a café politely.",
                "Apologize for bumping into someone.",
                "Thank a shopkeeper and say you're welcome.",
            ],
            "quiz": [
                {"question": "How do you say 'Thank you very much'?", "options": ["De rien", "Merci beaucoup", "S'il vous plaît", "Pardon"], "answer": 1},
                {"question": "What is the formal 'you're welcome'?", "options": ["De rien", "Merci", "Je vous en prie", "Pardon"], "answer": 2},
            ],
        },
    },
    {
        "title": "Comment ça va ? — How Are You?",
        "subtitle": "Ask and answer 'how are you' like a native",
        "description": "Master the most common French small-talk: asking how someone is, giving a real answer, and keeping the conversation going.",
        "category": "greetings",
        "difficulty": "A1",
        "order": 5,
        "duration_minutes": 9,
        "xp_reward": 15,
        "thumbnail_emoji": "😊",
        "is_free": True,
        "audio_script": "Comment allez-vous ? Ça va bien, merci. Et vous ? Je suis fatigué. Pas mal. Très bien !",
        "scenario_prompt": "You meet a French colleague in the morning. Exchange pleasantries: ask how they are and share how you're feeling.",
        "content": {
            "vocabulary": [
                {"word": "Comment allez-vous ?", "translation": "How are you? (formal)", "pronunciation": "koh-mahn tah-lay VOO"},
                {"word": "Comment ça va ?", "translation": "How's it going?", "pronunciation": "koh-mahn sah VAH"},
                {"word": "Ça va bien", "translation": "I'm doing well", "pronunciation": "sah vah BYAN"},
                {"word": "Pas mal", "translation": "Not bad", "pronunciation": "pah MAL"},
                {"word": "Très bien", "translation": "Very well", "pronunciation": "treh BYAN"},
                {"word": "Fatigué(e)", "translation": "Tired", "pronunciation": "fah-tee-GAY"},
                {"word": "Et vous ?", "translation": "And you? (formal)", "pronunciation": "ay VOO"},
                {"word": "Et toi ?", "translation": "And you? (informal)", "pronunciation": "ay TWAH"},
            ],
            "phrases": [
                {"french": "Comment ça va ?", "english": "How are you? / How's it going?"},
                {"french": "Ça va bien, merci !", "english": "I'm doing well, thank you!"},
                {"french": "Pas mal, et toi ?", "english": "Not bad, and you?"},
                {"french": "Je suis un peu fatigué(e).", "english": "I'm a little tired."},
                {"french": "Super ! Merci de demander.", "english": "Great! Thanks for asking."},
            ],
            "grammar_notes": "'Ça va' literally means 'it goes' — a very flexible expression. 'Comment vas-tu ?' (informal) and 'Comment allez-vous ?' (formal) both mean 'how are you?'",
            "speaking_prompts": [
                "Ask your friend how they are.",
                "Tell someone you're tired but okay.",
                "Have a 3-exchange small talk conversation.",
            ],
            "quiz": [
                {"question": "What is the informal version of 'Comment allez-vous ?'", "options": ["Comment ça va ?", "Et vous ?", "Très bien", "Ça va bien"], "answer": 0},
                {"question": "What does 'Pas mal' mean?", "options": ["Very good", "Not bad", "I'm tired", "Good night"], "answer": 1},
            ],
        },
    },

    # ─────────────────────────────────────────────────────
    # FOOD & DRINK
    # ─────────────────────────────────────────────────────
    {
        "title": "Au Café — At the Café",
        "subtitle": "Order coffee, croissants, and feel like a Parisian",
        "description": "Parisian café culture is world-famous. Learn how to order drinks and food, ask for the bill, and navigate café etiquette.",
        "category": "food_drink",
        "difficulty": "A1",
        "order": 6,
        "duration_minutes": 10,
        "xp_reward": 15,
        "thumbnail_emoji": "☕",
        "is_free": True,
        "audio_script": "Un café s'il vous plaît. Un croissant. L'addition s'il vous plaît. C'est combien ?",
        "scenario_prompt": "You walk into a Parisian café. Order a coffee and a croissant, ask for the WiFi password, then request the bill.",
        "content": {
            "vocabulary": [
                {"word": "un café", "translation": "an espresso / a coffee", "pronunciation": "uhn kah-FAY"},
                {"word": "un café au lait", "translation": "coffee with milk", "pronunciation": "kah-fay oh LAY"},
                {"word": "un croissant", "translation": "a croissant", "pronunciation": "kwah-SAHN"},
                {"word": "un thé", "translation": "a tea", "pronunciation": "uhn TAY"},
                {"word": "l'eau", "translation": "water", "pronunciation": "LOH"},
                {"word": "l'addition", "translation": "the bill", "pronunciation": "lah-dee-SYOHN"},
                {"word": "C'est combien ?", "translation": "How much is it?", "pronunciation": "say kohm-BYAN"},
            ],
            "phrases": [
                {"french": "Un café, s'il vous plaît.", "english": "A coffee, please."},
                {"french": "Je voudrais un croissant.", "english": "I would like a croissant."},
                {"french": "L'addition, s'il vous plaît.", "english": "The bill, please."},
                {"french": "C'est combien ?", "english": "How much is it?"},
                {"french": "Est-ce qu'il y a du WiFi ?", "english": "Is there WiFi?"},
                {"french": "La carte, s'il vous plaît.", "english": "The menu, please."},
            ],
            "grammar_notes": "'Je voudrais' (I would like) is more polite than 'Je veux' (I want). Always use 'voudrais' in a restaurant or café.",
            "speaking_prompts": [
                "Order two coffees and a croissant.",
                "Ask for the bill after your meal.",
                "Ask the waiter if there's a table available.",
            ],
            "quiz": [
                {"question": "How do you ask for the bill?", "options": ["Un café", "La carte", "L'addition, s'il vous plaît", "C'est combien ?"], "answer": 2},
                {"question": "What is 'un café au lait'?", "options": ["Black coffee", "Tea with milk", "Coffee with milk", "Hot chocolate"], "answer": 2},
            ],
        },
    },
    {
        "title": "Au Restaurant — Dining Out",
        "subtitle": "Navigate a full French restaurant experience",
        "description": "From reservations to dessert — learn the complete restaurant vocabulary and how to have a smooth dining experience in French.",
        "category": "food_drink",
        "difficulty": "A2",
        "order": 7,
        "duration_minutes": 15,
        "xp_reward": 20,
        "thumbnail_emoji": "🍽️",
        "is_free": False,
        "audio_script": "J'ai une réservation. Je voudrais commander. Qu'est-ce que vous recommandez ? L'ensemble du repas était délicieux.",
        "scenario_prompt": "You have a dinner reservation at a nice French restaurant. Order a starter, main course, and dessert. Ask the waiter for recommendations.",
        "content": {
            "vocabulary": [
                {"word": "une réservation", "translation": "a reservation", "pronunciation": "ray-zair-vah-SYOHN"},
                {"word": "commander", "translation": "to order", "pronunciation": "koh-mahn-DAY"},
                {"word": "l'entrée", "translation": "starter / appetizer", "pronunciation": "lahn-TRAY"},
                {"word": "le plat principal", "translation": "main course", "pronunciation": "luh plah pran-see-PAL"},
                {"word": "le dessert", "translation": "dessert", "pronunciation": "luh deh-SAIR"},
                {"word": "la carte des vins", "translation": "wine list", "pronunciation": "lah kart day VAN"},
                {"word": "délicieux", "translation": "delicious", "pronunciation": "day-lee-SYUH"},
                {"word": "allergique à", "translation": "allergic to", "pronunciation": "ah-lair-ZHEEK ah"},
            ],
            "phrases": [
                {"french": "J'ai une réservation au nom de Martin.", "english": "I have a reservation under the name Martin."},
                {"french": "Qu'est-ce que vous recommandez ?", "english": "What do you recommend?"},
                {"french": "Je suis végétarien(ne).", "english": "I am vegetarian."},
                {"french": "Je suis allergique aux noix.", "english": "I am allergic to nuts."},
                {"french": "C'était délicieux, merci !", "english": "It was delicious, thank you!"},
                {"french": "On peut avoir l'addition ?", "english": "Could we have the bill?"},
            ],
            "grammar_notes": "The passé composé (past tense) is used to describe the meal: 'C'était délicieux' = 'It was delicious'. 'C'était' is the past of 'c'est' (it is).",
            "speaking_prompts": [
                "Make a reservation for two people, Saturday at 8pm.",
                "Tell the waiter about a food allergy.",
                "Compliment the chef on the meal.",
            ],
            "quiz": [
                {"question": "What is 'l'entrée' in French dining?", "options": ["Main course", "Dessert", "Starter", "Drink"], "answer": 2},
                {"question": "How do you say 'I am vegetarian'?", "options": ["Je suis allergique", "Je suis végétarien", "Je voudrais commander", "Qu'est-ce que vous recommandez"], "answer": 1},
            ],
        },
    },
    {
        "title": "Les Courses — Grocery Shopping",
        "subtitle": "Buy fruits, vegetables, and everyday items in French",
        "description": "Learn essential food vocabulary and how to shop at a French market or supermarket — quantities, prices, and preferences.",
        "category": "food_drink",
        "difficulty": "A2",
        "order": 8,
        "duration_minutes": 12,
        "xp_reward": 15,
        "thumbnail_emoji": "🛒",
        "is_free": False,
        "audio_script": "Je voudrais un kilo de tomates. Avez-vous des pommes ? C'est trop cher. Je prends celui-ci.",
        "scenario_prompt": "You're at a French marché (outdoor market). Buy some fruit and vegetables, ask about prices, and make your choices.",
        "content": {
            "vocabulary": [
                {"word": "les fruits", "translation": "fruits", "pronunciation": "lay FRWEE"},
                {"word": "les légumes", "translation": "vegetables", "pronunciation": "lay lay-GOOM"},
                {"word": "une pomme", "translation": "an apple", "pronunciation": "ewn PUM"},
                {"word": "une tomate", "translation": "a tomato", "pronunciation": "ewn toh-MAT"},
                {"word": "un kilo de", "translation": "a kilogram of", "pronunciation": "uhn kee-loh DUH"},
                {"word": "Ça coûte combien ?", "translation": "How much does it cost?", "pronunciation": "sah koot kohm-BYAN"},
                {"word": "trop cher", "translation": "too expensive", "pronunciation": "troh SHAIR"},
                {"word": "bon marché", "translation": "cheap / inexpensive", "pronunciation": "bohn mar-SHAY"},
            ],
            "phrases": [
                {"french": "Je voudrais un kilo de pommes.", "english": "I would like a kilogram of apples."},
                {"french": "Avez-vous des fraises ?", "english": "Do you have strawberries?"},
                {"french": "C'est combien le kilo ?", "english": "How much is it per kilogram?"},
                {"french": "C'est un peu cher.", "english": "It's a little expensive."},
                {"french": "Je prends ça.", "english": "I'll take this."},
                {"french": "Vous avez autre chose ?", "english": "Do you have anything else?"},
            ],
            "grammar_notes": "Partitive articles: 'du pain' (some bread), 'de la confiture' (some jam), 'des pommes' (some apples). Use these when you don't specify a quantity.",
            "speaking_prompts": [
                "Buy 500g of tomatoes and 1kg of apples.",
                "Ask if they have fresh strawberries.",
                "Negotiate on a price you think is too high.",
            ],
            "quiz": [
                {"question": "How do you say '1 kilogram of tomatoes'?", "options": ["Un kilo de pommes", "Un kilo de tomates", "Des légumes", "Du pain"], "answer": 1},
                {"question": "What does 'bon marché' mean?", "options": ["Good market", "Very expensive", "Inexpensive", "Fresh produce"], "answer": 2},
            ],
        },
    },
    {
        "title": "Les Boissons — Drinks & Beverages",
        "subtitle": "From wine to water — French drink culture",
        "description": "Explore French beverage vocabulary — wine, coffee, juice, and water. Learn how to order drinks and talk about your preferences.",
        "category": "food_drink",
        "difficulty": "A1",
        "order": 9,
        "duration_minutes": 8,
        "xp_reward": 10,
        "thumbnail_emoji": "🍷",
        "is_free": True,
        "audio_script": "Un verre de vin rouge. Une bière pression. Un jus d'orange. De l'eau plate ou gazeuse ?",
        "scenario_prompt": "You're at a bar with French friends. Order drinks for everyone and talk about your drink preferences.",
        "content": {
            "vocabulary": [
                {"word": "le vin rouge", "translation": "red wine", "pronunciation": "luh van ROOZH"},
                {"word": "le vin blanc", "translation": "white wine", "pronunciation": "luh van BLAHN"},
                {"word": "la bière", "translation": "beer", "pronunciation": "lah BYAIR"},
                {"word": "le jus d'orange", "translation": "orange juice", "pronunciation": "luh zhoo doh-RAHNZH"},
                {"word": "l'eau plate", "translation": "still water", "pronunciation": "loh PLAHT"},
                {"word": "l'eau gazeuse", "translation": "sparkling water", "pronunciation": "loh gah-ZUHZ"},
                {"word": "J'aime", "translation": "I like / I love", "pronunciation": "ZHEM"},
                {"word": "Je préfère", "translation": "I prefer", "pronunciation": "zhuh pray-FAIR"},
            ],
            "phrases": [
                {"french": "Un verre de vin rouge, s'il vous plaît.", "english": "A glass of red wine, please."},
                {"french": "Plate ou gazeuse ?", "english": "Still or sparkling (water)?"},
                {"french": "J'aime beaucoup le vin français.", "english": "I love French wine."},
                {"french": "Je préfère le café au thé.", "english": "I prefer coffee to tea."},
                {"french": "Sans alcool, s'il vous plaît.", "english": "Without alcohol, please."},
            ],
            "grammar_notes": "'J'aime' + noun = I like. 'Je préfère X à Y' = I prefer X to Y. These are very useful for expressing preferences in any context.",
            "speaking_prompts": [
                "Order drinks for a table of three.",
                "Tell someone your drink preferences.",
                "Ask the waiter what wines they recommend.",
            ],
            "quiz": [
                {"question": "What is 'l'eau gazeuse'?", "options": ["Still water", "Sparkling water", "Juice", "Wine"], "answer": 1},
                {"question": "How do you say 'I prefer' in French?", "options": ["J'aime", "Je voudrais", "Je préfère", "Je prends"], "answer": 2},
            ],
        },
    },

    # ─────────────────────────────────────────────────────
    # TRAVEL
    # ─────────────────────────────────────────────────────
    {
        "title": "À l'Aéroport — At the Airport",
        "subtitle": "Navigate French airports with confidence",
        "description": "From check-in to boarding — learn the essential airport vocabulary and phrases to travel through French-speaking countries.",
        "category": "travel",
        "difficulty": "A2",
        "order": 10,
        "duration_minutes": 12,
        "xp_reward": 15,
        "thumbnail_emoji": "✈️",
        "is_free": False,
        "audio_script": "Où est l'enregistrement ? Mon vol est à quelle heure ? J'ai perdu ma valise. Quelle est la porte d'embarquement ?",
        "scenario_prompt": "You're at Charles de Gaulle airport. Check in, go through security, find your gate, and deal with a delayed flight.",
        "content": {
            "vocabulary": [
                {"word": "l'aéroport", "translation": "the airport", "pronunciation": "lah-ay-roh-POR"},
                {"word": "le vol", "translation": "the flight", "pronunciation": "luh VOL"},
                {"word": "l'enregistrement", "translation": "check-in", "pronunciation": "lahn-ruh-zhees-truh-MAHN"},
                {"word": "la porte", "translation": "the gate", "pronunciation": "lah PORT"},
                {"word": "la valise", "translation": "the suitcase", "pronunciation": "lah vah-LEEZ"},
                {"word": "le passeport", "translation": "the passport", "pronunciation": "luh pah-spor"},
                {"word": "en retard", "translation": "delayed / late", "pronunciation": "ahn ruh-TAR"},
                {"word": "à l'heure", "translation": "on time", "pronunciation": "ah LUHR"},
            ],
            "phrases": [
                {"french": "Où est l'enregistrement ?", "english": "Where is the check-in?"},
                {"french": "Mon vol est à quelle heure ?", "english": "What time is my flight?"},
                {"french": "Quelle est la porte d'embarquement ?", "english": "What is the boarding gate?"},
                {"french": "J'ai perdu ma valise.", "english": "I lost my suitcase."},
                {"french": "Mon vol est en retard.", "english": "My flight is delayed."},
                {"french": "Voici mon passeport.", "english": "Here is my passport."},
            ],
            "grammar_notes": "Questions in French: 'Où est...?' (Where is...?), 'Quelle est...?' (What is...?), 'À quelle heure...?' (At what time...?). These question starters are very versatile.",
            "speaking_prompts": [
                "Ask where the check-in desk is.",
                "Report a lost suitcase to airport staff.",
                "Ask about your connecting flight.",
            ],
            "quiz": [
                {"question": "How do you say 'My flight is delayed'?", "options": ["Mon vol est à l'heure", "J'ai perdu ma valise", "Mon vol est en retard", "Voici mon passeport"], "answer": 2},
                {"question": "What is 'la porte' in airport context?", "options": ["The door", "The gate", "The flight", "The passport"], "answer": 1},
            ],
        },
    },
    {
        "title": "Dans le Métro — Metro & Public Transport",
        "subtitle": "Get around Paris by metro, bus, and train",
        "description": "Paris has an excellent metro system. Learn how to buy tickets, read maps, ask for directions, and navigate like a local.",
        "category": "travel",
        "difficulty": "A2",
        "order": 11,
        "duration_minutes": 12,
        "xp_reward": 15,
        "thumbnail_emoji": "🚇",
        "is_free": False,
        "audio_script": "Un carnet s'il vous plaît. Quelle ligne pour aller à la Tour Eiffel ? Je dois changer à Châtelet. Validez votre titre de transport.",
        "scenario_prompt": "You need to get from your hotel to the Eiffel Tower by metro. Buy a ticket, find the right line, and change trains.",
        "content": {
            "vocabulary": [
                {"word": "le métro", "translation": "the subway / metro", "pronunciation": "luh may-TROH"},
                {"word": "la ligne", "translation": "the line", "pronunciation": "lah LEEN-yuh"},
                {"word": "le ticket", "translation": "the ticket", "pronunciation": "luh tee-KAY"},
                {"word": "un carnet", "translation": "a book of 10 tickets", "pronunciation": "uhn kar-NAY"},
                {"word": "changer", "translation": "to change (trains)", "pronunciation": "shahn-ZHAY"},
                {"word": "la direction", "translation": "the direction", "pronunciation": "lah dee-rek-SYOHN"},
                {"word": "la sortie", "translation": "the exit", "pronunciation": "lah sor-TEE"},
                {"word": "valider", "translation": "to validate (ticket)", "pronunciation": "vah-lee-DAY"},
            ],
            "phrases": [
                {"french": "Un ticket, s'il vous plaît.", "english": "One ticket, please."},
                {"french": "Quelle ligne pour aller à...?", "english": "Which line to get to...?"},
                {"french": "Je dois changer où ?", "english": "Where do I change (trains)?"},
                {"french": "C'est quelle direction ?", "english": "Which direction is it?"},
                {"french": "Où est la sortie ?", "english": "Where is the exit?"},
                {"french": "Est-ce que ce train va à...?", "english": "Does this train go to...?"},
            ],
            "grammar_notes": "Prepositions of direction: 'aller à' (to go to), 'venir de' (to come from). Remember that 'à + le = au' and 'à + les = aux'.",
            "speaking_prompts": [
                "Ask which metro line goes to the Louvre.",
                "Ask a fellow passenger where to change trains.",
                "Buy a carnet of tickets at the booth.",
            ],
            "quiz": [
                {"question": "What is 'un carnet'?", "options": ["A single ticket", "A book of 10 tickets", "A monthly pass", "A bus ticket"], "answer": 1},
                {"question": "How do you say 'Where is the exit'?", "options": ["Où est la sortie ?", "Quelle ligne ?", "Je dois changer", "Validez"], "answer": 0},
            ],
        },
    },
    {
        "title": "À l'Hôtel — Hotel Check-in",
        "subtitle": "Check in, make requests, and feel at home in French hotels",
        "description": "Navigate a French hotel from booking to checkout. Handle room requests, complaints, and amenities in French.",
        "category": "travel",
        "difficulty": "B1",
        "order": 12,
        "duration_minutes": 15,
        "xp_reward": 20,
        "thumbnail_emoji": "🏨",
        "is_free": False,
        "audio_script": "J'ai une réservation au nom de Dupont. Une chambre double avec salle de bains. Le WiFi ne fonctionne pas.",
        "scenario_prompt": "You arrive at a Paris hotel. Check in with your reservation, ask about amenities, report that the WiFi isn't working, and request a wake-up call.",
        "content": {
            "vocabulary": [
                {"word": "une chambre", "translation": "a room", "pronunciation": "ewn SHAHN-bruh"},
                {"word": "une chambre double", "translation": "a double room", "pronunciation": "ewn shahn-bruh DOO-bluh"},
                {"word": "le petit-déjeuner", "translation": "breakfast", "pronunciation": "luh puh-tee day-zhuh-NAY"},
                {"word": "la salle de bains", "translation": "the bathroom", "pronunciation": "lah sal duh BAN"},
                {"word": "la clé", "translation": "the key", "pronunciation": "lah KLAY"},
                {"word": "l'ascenseur", "translation": "the elevator", "pronunciation": "lah-sahn-SUHR"},
                {"word": "ne fonctionne pas", "translation": "doesn't work", "pronunciation": "nuh fonk-syon PAH"},
                {"word": "le réveil", "translation": "wake-up call / alarm", "pronunciation": "luh ray-VAY"},
            ],
            "phrases": [
                {"french": "J'ai une réservation au nom de Martin.", "english": "I have a reservation under the name Martin."},
                {"french": "Est-ce que le petit-déjeuner est inclus ?", "english": "Is breakfast included?"},
                {"french": "Ma clé ne fonctionne pas.", "english": "My key doesn't work."},
                {"french": "Pouvez-vous me réveiller à 7h ?", "english": "Could you wake me up at 7am?"},
                {"french": "L'ascenseur est où ?", "english": "Where is the elevator?"},
                {"french": "Je voudrais une chambre plus calme.", "english": "I'd like a quieter room."},
            ],
            "grammar_notes": "Polite requests use 'Pouvez-vous...?' (Can you...?) or 'Est-ce que vous pouvez...?' Both are correct and polite in a hotel context.",
            "speaking_prompts": [
                "Check in with a reservation.",
                "Report a problem with your room.",
                "Ask about hotel facilities.",
            ],
            "quiz": [
                {"question": "How do you say 'a double room'?", "options": ["Une chambre simple", "Une chambre double", "Une suite", "Un appartement"], "answer": 1},
                {"question": "What is 'le petit-déjeuner'?", "options": ["Dinner", "Lunch", "Breakfast", "Snack"], "answer": 2},
            ],
        },
    },
    {
        "title": "Demander son Chemin — Asking for Directions",
        "subtitle": "Never get lost in a French city again",
        "description": "Learn how to ask for and understand directions in French — left, right, straight ahead, and landmarks.",
        "category": "travel",
        "difficulty": "A2",
        "order": 13,
        "duration_minutes": 12,
        "xp_reward": 15,
        "thumbnail_emoji": "🗺️",
        "is_free": False,
        "audio_script": "Excusez-moi, où est la boulangerie ? Tournez à gauche. Allez tout droit. C'est à droite après le feu.",
        "scenario_prompt": "A French tourist asks you for directions to the nearest pharmacy. Give them clear directions using landmarks.",
        "content": {
            "vocabulary": [
                {"word": "à gauche", "translation": "to the left", "pronunciation": "ah GOHSH"},
                {"word": "à droite", "translation": "to the right", "pronunciation": "ah DRWAHT"},
                {"word": "tout droit", "translation": "straight ahead", "pronunciation": "too DRWAH"},
                {"word": "tournez", "translation": "turn", "pronunciation": "toor-NAY"},
                {"word": "le carrefour", "translation": "the crossroads / intersection", "pronunciation": "luh kar-FOOR"},
                {"word": "le feu rouge", "translation": "the traffic light", "pronunciation": "luh fuh ROOZH"},
                {"word": "en face de", "translation": "opposite / across from", "pronunciation": "ahn fass DUH"},
                {"word": "au bout de", "translation": "at the end of", "pronunciation": "oh boo DUH"},
            ],
            "phrases": [
                {"french": "Excusez-moi, où est la pharmacie ?", "english": "Excuse me, where is the pharmacy?"},
                {"french": "Tournez à gauche au carrefour.", "english": "Turn left at the intersection."},
                {"french": "Allez tout droit pendant 200 mètres.", "english": "Go straight for 200 meters."},
                {"french": "C'est à droite après le feu rouge.", "english": "It's on the right after the traffic light."},
                {"french": "Je suis perdu(e).", "english": "I'm lost."},
                {"french": "C'est loin d'ici ?", "english": "Is it far from here?"},
            ],
            "grammar_notes": "Imperative (command form): 'Tournez' (turn), 'Allez' (go), 'Continuez' (continue). These are the vous-form imperative, used when giving directions politely.",
            "speaking_prompts": [
                "Give directions to the nearest café.",
                "Ask how far the train station is.",
                "Describe a route using 3 or more steps.",
            ],
            "quiz": [
                {"question": "What does 'tournez à gauche' mean?", "options": ["Turn right", "Go straight", "Turn left", "Stop here"], "answer": 2},
                {"question": "How do you say 'I'm lost'?", "options": ["Je suis en retard", "Je suis perdu", "Je cherche", "Excusez-moi"], "answer": 1},
            ],
        },
    },

    # ─────────────────────────────────────────────────────
    # GRAMMAR BASICS
    # ─────────────────────────────────────────────────────
    {
        "title": "Être et Avoir — To Be & To Have",
        "subtitle": "The two most essential French verbs",
        "description": "Master 'être' (to be) and 'avoir' (to have) — these two verbs are the foundation of all French grammar and are used in almost every sentence.",
        "category": "grammar",
        "difficulty": "A1",
        "order": 14,
        "duration_minutes": 15,
        "xp_reward": 20,
        "thumbnail_emoji": "📝",
        "is_free": True,
        "audio_script": "Je suis. Tu es. Il est. Elle est. Nous sommes. Vous êtes. Ils sont. J'ai. Tu as. Il a. Nous avons. Vous avez. Ils ont.",
        "scenario_prompt": "Practice using être and avoir. Describe yourself and your possessions in French.",
        "content": {
            "vocabulary": [
                {"word": "être", "translation": "to be", "pronunciation": "EH-truh"},
                {"word": "avoir", "translation": "to have", "pronunciation": "ah-VWAHR"},
                {"word": "je suis", "translation": "I am", "pronunciation": "zhuh SWEE"},
                {"word": "j'ai", "translation": "I have", "pronunciation": "ZHAY"},
                {"word": "nous sommes", "translation": "we are", "pronunciation": "noo SUM"},
                {"word": "vous avez", "translation": "you have (formal/plural)", "pronunciation": "voo zah-VAY"},
            ],
            "phrases": [
                {"french": "Je suis étudiant.", "english": "I am a student."},
                {"french": "Elle est française.", "english": "She is French."},
                {"french": "Nous sommes fatigués.", "english": "We are tired."},
                {"french": "J'ai vingt ans.", "english": "I am twenty years old. (lit: I have 20 years)"},
                {"french": "Il a une voiture.", "english": "He has a car."},
                {"french": "Vous avez le temps ?", "english": "Do you have the time?"},
            ],
            "grammar_notes": "ÊTRE conjugation: je suis, tu es, il/elle est, nous sommes, vous êtes, ils/elles sont\n\nAVOIR conjugation: j'ai, tu as, il/elle a, nous avons, vous avez, ils/elles ont\n\nNote: Age in French uses AVOIR, not ÊTRE: 'J'ai 25 ans' (I am 25).",
            "speaking_prompts": [
                "Describe yourself using être (nationality, profession).",
                "Talk about what you have using avoir.",
                "Conjugate both verbs with all pronouns.",
            ],
            "quiz": [
                {"question": "What is the correct form of 'être' for 'nous'?", "options": ["nous sont", "nous êtes", "nous sommes", "nous avons"], "answer": 2},
                {"question": "How do you say 'I am 30 years old' in French?", "options": ["Je suis trente ans", "J'ai trente ans", "Je suis trente", "J'ai trente années"], "answer": 1},
                {"question": "What is 'vous avez'?", "options": ["You are", "You have", "We are", "They have"], "answer": 1},
            ],
        },
    },
    {
        "title": "Les Articles — French Articles",
        "subtitle": "le, la, les, un, une, des — mastered",
        "description": "French nouns always need an article. Learn the difference between definite (the) and indefinite (a/an) articles, and how gender affects them.",
        "category": "grammar",
        "difficulty": "A1",
        "order": 15,
        "duration_minutes": 12,
        "xp_reward": 20,
        "thumbnail_emoji": "📖",
        "is_free": True,
        "audio_script": "Le livre. La table. Les enfants. Un chien. Une maison. Des fruits. Du pain. De la eau.",
        "scenario_prompt": "Practice using the correct articles. Describe items around you in French using definite and indefinite articles.",
        "content": {
            "vocabulary": [
                {"word": "le", "translation": "the (masc. sing.)", "pronunciation": "luh"},
                {"word": "la", "translation": "the (fem. sing.)", "pronunciation": "lah"},
                {"word": "les", "translation": "the (plural)", "pronunciation": "lay"},
                {"word": "un", "translation": "a / an (masc.)", "pronunciation": "uhn"},
                {"word": "une", "translation": "a / an (fem.)", "pronunciation": "ewn"},
                {"word": "des", "translation": "some (plural)", "pronunciation": "day"},
                {"word": "du", "translation": "some (masc.) / of the", "pronunciation": "due"},
                {"word": "de la", "translation": "some (fem.)", "pronunciation": "duh lah"},
            ],
            "phrases": [
                {"french": "Le livre est intéressant.", "english": "The book is interesting. (masc.)"},
                {"french": "La maison est grande.", "english": "The house is big. (fem.)"},
                {"french": "J'ai un chien.", "english": "I have a dog. (masc.)"},
                {"french": "Elle mange une pomme.", "english": "She is eating an apple. (fem.)"},
                {"french": "Je bois du café.", "english": "I drink coffee. (some coffee)"},
                {"french": "Il y a des étudiants.", "english": "There are (some) students."},
            ],
            "grammar_notes": "Every French noun has a gender (masculine or feminine). There's no rule — you must memorize gender with the word.\n\nDefinite: le/la/les (specific)\nIndefinite: un/une/des (non-specific)\nPartitive: du/de la/des (some — for uncountable things)",
            "speaking_prompts": [
                "List 5 items in your room with correct articles.",
                "Describe what you eat for breakfast using articles.",
                "Change definite articles to indefinite and vice versa.",
            ],
            "quiz": [
                {"question": "Which article is used for feminine singular nouns (the)?", "options": ["le", "la", "les", "un"], "answer": 1},
                {"question": "How do you say 'some bread' (partitive)?", "options": ["Le pain", "Un pain", "Du pain", "Des pain"], "answer": 2},
                {"question": "Which article would you use before 'enfants' (children)?", "options": ["le", "la", "les", "un"], "answer": 2},
            ],
        },
    },
    {
        "title": "Les Nombres — Numbers 1 to 100",
        "subtitle": "Count, calculate, and talk about quantities",
        "description": "Master French numbers from 1 to 100, including the tricky 70s, 80s and 90s. Learn to use numbers in everyday situations.",
        "category": "grammar",
        "difficulty": "A1",
        "order": 16,
        "duration_minutes": 15,
        "xp_reward": 15,
        "thumbnail_emoji": "🔢",
        "is_free": True,
        "audio_script": "Un, deux, trois, quatre, cinq, six, sept, huit, neuf, dix. Vingt. Trente. Quarante. Cinquante. Soixante. Soixante-dix. Quatre-vingts. Quatre-vingt-dix. Cent.",
        "scenario_prompt": "Practice counting in French. Tell someone your phone number, your address number, and the price of items.",
        "content": {
            "vocabulary": [
                {"word": "un / une", "translation": "1", "pronunciation": "uhn / ewn"},
                {"word": "deux", "translation": "2", "pronunciation": "DUH"},
                {"word": "dix", "translation": "10", "pronunciation": "DEES"},
                {"word": "vingt", "translation": "20", "pronunciation": "VAN"},
                {"word": "trente", "translation": "30", "pronunciation": "TRAHNT"},
                {"word": "soixante", "translation": "60", "pronunciation": "swah-SAHNT"},
                {"word": "soixante-dix", "translation": "70 (lit: sixty-ten)", "pronunciation": "swah-sahnt DEES"},
                {"word": "quatre-vingts", "translation": "80 (lit: four-twenties)", "pronunciation": "katr VAN"},
                {"word": "quatre-vingt-dix", "translation": "90 (lit: four-twenty-ten)", "pronunciation": "katr-van DEES"},
                {"word": "cent", "translation": "100", "pronunciation": "SAHN"},
            ],
            "phrases": [
                {"french": "J'ai vingt-cinq ans.", "english": "I am 25 years old."},
                {"french": "Ça coûte trente-deux euros.", "english": "It costs 32 euros."},
                {"french": "Mon numéro est le 06 12 34 56 78.", "english": "My number is 06 12 34 56 78."},
                {"french": "Il y a quatre-vingts personnes.", "english": "There are 80 people."},
                {"french": "C'est au quatre-vingt-dixième étage.", "english": "It's on the 90th floor."},
            ],
            "grammar_notes": "French numbers have quirks:\n- 70 = soixante-dix (60+10)\n- 80 = quatre-vingts (4×20)\n- 90 = quatre-vingt-dix (4×20+10)\n- 71 = soixante et onze\n- 81 = quatre-vingt-un (no 'et')\n\nBelgium and Switzerland use: septante (70), huitante (80), nonante (90).",
            "speaking_prompts": [
                "Count from 1 to 20 out loud.",
                "Say your phone number digit by digit.",
                "Practice the tricky 70s, 80s, and 90s.",
            ],
            "quiz": [
                {"question": "How do you say '70' in French (France)?", "options": ["septante", "soixante-dix", "soixante-vingt", "sept-dix"], "answer": 1},
                {"question": "What does 'quatre-vingts' literally mean?", "options": ["Four-tens", "Four-twenties", "Eighty times", "Four plus twenty"], "answer": 1},
                {"question": "How do you say '93'?", "options": ["quatre-vingt-treize", "nonante-trois", "soixante-treize", "quatre-vingt-dix-trois"], "answer": 0},
            ],
        },
    },
    {
        "title": "L'Adjectif — Adjective Agreement",
        "subtitle": "Make your adjectives agree in gender and number",
        "description": "French adjectives must match the noun they describe in both gender (masculine/feminine) and number (singular/plural). Learn the patterns.",
        "category": "grammar",
        "difficulty": "B1",
        "order": 17,
        "duration_minutes": 15,
        "xp_reward": 25,
        "thumbnail_emoji": "✏️",
        "is_free": False,
        "audio_script": "Un homme grand. Une femme grande. Des hommes grands. Des femmes grandes. Un livre intéressant. Une histoire intéressante.",
        "scenario_prompt": "Describe people and objects around you using adjectives that agree with gender and number.",
        "content": {
            "vocabulary": [
                {"word": "grand / grande", "translation": "tall / big (m/f)", "pronunciation": "GRAHN / GRAHND"},
                {"word": "petit / petite", "translation": "small (m/f)", "pronunciation": "puh-TEE / puh-TEET"},
                {"word": "beau / belle", "translation": "beautiful (m/f)", "pronunciation": "BOH / BELL"},
                {"word": "nouveau / nouvelle", "translation": "new (m/f)", "pronunciation": "noo-VOH / noo-VELL"},
                {"word": "vieux / vieille", "translation": "old (m/f)", "pronunciation": "VYUH / VYAY"},
                {"word": "intéressant(e)", "translation": "interesting", "pronunciation": "an-tay-reh-SAHN(T)"},
            ],
            "phrases": [
                {"french": "C'est un grand appartement.", "english": "It's a big apartment. (masc.)"},
                {"french": "Elle habite dans une grande maison.", "english": "She lives in a big house. (fem.)"},
                {"french": "J'ai un nouveau téléphone.", "english": "I have a new phone. (masc.)"},
                {"french": "C'est une nouvelle voiture.", "english": "It's a new car. (fem.)"},
                {"french": "Ce sont de beaux enfants.", "english": "These are beautiful children."},
            ],
            "grammar_notes": "Rules for adjective agreement:\n1. Add -e for feminine: grand → grande\n2. Add -s for plural: grand → grands\n3. Add -es for feminine plural: grande → grandes\n4. Irregular adjectives: beau/belle, vieux/vieille, nouveau/nouvelle\n5. Most adjectives go AFTER the noun in French (unlike English)\n6. BANGS adjectives (Beauty, Age, Number, Goodness, Size) go BEFORE",
            "speaking_prompts": [
                "Describe your home using 5 adjectives.",
                "Talk about a friend's appearance.",
                "Correct these sentences by making adjectives agree.",
            ],
            "quiz": [
                {"question": "What is the feminine form of 'petit'?", "options": ["petite", "petits", "petites", "petit"], "answer": 0},
                {"question": "Where do most French adjectives go?", "options": ["Before the noun", "After the noun", "Either position", "Always at the end"], "answer": 1},
                {"question": "What is the feminine of 'beau'?", "options": ["beaue", "beaux", "belle", "belles"], "answer": 2},
            ],
        },
    },

    # ─────────────────────────────────────────────────────
    # ROLE-PLAY SCENARIOS
    # ─────────────────────────────────────────────────────
    {
        "title": "Un Entretien d'Embauche — Job Interview",
        "subtitle": "Impress a French employer with professional vocabulary",
        "description": "Practice a complete job interview in French — from introducing yourself professionally to answering tough questions about your experience.",
        "category": "roleplay",
        "difficulty": "B2",
        "order": 18,
        "duration_minutes": 20,
        "xp_reward": 30,
        "thumbnail_emoji": "💼",
        "is_free": False,
        "audio_script": "Parlez-moi de vous. Quelles sont vos qualités ? Pourquoi voulez-vous travailler ici ? Quelles sont vos prétentions salariales ?",
        "scenario_prompt": "You're interviewing for a marketing position at a French company. Answer questions about your background, skills, and motivations. The interviewer will ask typical French interview questions.",
        "content": {
            "vocabulary": [
                {"word": "le CV", "translation": "résumé / CV", "pronunciation": "luh say-VAY"},
                {"word": "l'expérience", "translation": "experience", "pronunciation": "lex-pay-ree-AHNS"},
                {"word": "les compétences", "translation": "skills / competencies", "pronunciation": "lay kohm-pay-TAHNS"},
                {"word": "le poste", "translation": "the position / job", "pronunciation": "luh POST"},
                {"word": "le salaire", "translation": "the salary", "pronunciation": "luh sah-LAIR"},
                {"word": "disponible", "translation": "available", "pronunciation": "dee-spoh-NEE-bluh"},
                {"word": "motivé(e)", "translation": "motivated", "pronunciation": "moh-tee-VAY"},
                {"word": "les qualités", "translation": "qualities / strengths", "pronunciation": "lay kah-lee-TAY"},
            ],
            "phrases": [
                {"french": "Je suis très motivé par ce poste.", "english": "I am very motivated by this position."},
                {"french": "J'ai cinq ans d'expérience en marketing.", "english": "I have five years of experience in marketing."},
                {"french": "Mes principales qualités sont...", "english": "My main qualities are..."},
                {"french": "Je suis disponible immédiatement.", "english": "I am available immediately."},
                {"french": "Quelles sont les perspectives d'évolution ?", "english": "What are the growth opportunities?"},
                {"french": "J'ai une question concernant le salaire.", "english": "I have a question regarding the salary."},
            ],
            "grammar_notes": "Professional French uses 'vous' exclusively. Also learn the conditional tense for polite requests: 'Je souhaiterais' (I would like), 'Pourriez-vous' (Could you).",
            "speaking_prompts": [
                "Introduce yourself professionally in 2 minutes.",
                "Explain why you want this specific job.",
                "Describe your biggest professional achievement.",
                "Ask 3 questions about the company.",
            ],
            "quiz": [
                {"question": "How do you say 'I have 3 years of experience'?", "options": ["J'ai trois ans de travail", "J'ai trois ans d'expérience", "Je suis trois ans", "J'ai travaillé trois"], "answer": 1},
                {"question": "What is 'les compétences'?", "options": ["The jobs", "The salary", "The skills", "The experience"], "answer": 2},
            ],
        },
    },
    {
        "title": "Au Marché — Shopping at the Market",
        "subtitle": "Bargain, browse, and buy at a French market",
        "description": "French outdoor markets are vibrant cultural experiences. Learn to browse, ask about products, negotiate prices, and chat with vendors.",
        "category": "roleplay",
        "difficulty": "B1",
        "order": 19,
        "duration_minutes": 15,
        "xp_reward": 25,
        "thumbnail_emoji": "🏪",
        "is_free": False,
        "audio_script": "C'est fait main ? Vous pouvez faire un prix ? C'est de la région ? Je cherche un cadeau pour ma mère.",
        "scenario_prompt": "You're at a Sunday market in Provence. Browse handmade goods, ask vendors about their products, and try to negotiate a price on something you like.",
        "content": {
            "vocabulary": [
                {"word": "fait main", "translation": "handmade", "pronunciation": "fay MAN"},
                {"word": "la région", "translation": "the region / local area", "pronunciation": "lah ray-ZHOHN"},
                {"word": "un cadeau", "translation": "a gift", "pronunciation": "uhn kah-DOH"},
                {"word": "la réduction", "translation": "the discount", "pronunciation": "lah ray-dook-SYOHN"},
                {"word": "ça m'intéresse", "translation": "that interests me", "pronunciation": "sah man-tay-RESS"},
                {"word": "c'est trop cher", "translation": "it's too expensive", "pronunciation": "say troh SHAIR"},
                {"word": "dernier prix", "translation": "final / best price", "pronunciation": "dair-NYAY PREE"},
                {"word": "emporter", "translation": "to take away", "pronunciation": "ahm-por-TAY"},
            ],
            "phrases": [
                {"french": "C'est fait main ?", "english": "Is it handmade?"},
                {"french": "Vous pouvez faire un geste sur le prix ?", "english": "Could you give me a better price?"},
                {"french": "C'est de la région ?", "english": "Is it from the local area?"},
                {"french": "Je cherche quelque chose pour offrir.", "english": "I'm looking for something to give as a gift."},
                {"french": "Je vais réfléchir.", "english": "I'll think about it."},
                {"french": "C'est votre meilleur prix ?", "english": "Is that your best price?"},
            ],
            "grammar_notes": "Conditional mood for polite requests: 'Vous pourriez...' (Could you...), 'Vous auriez...' (Would you have...). This makes you sound much more native when shopping.",
            "speaking_prompts": [
                "Ask a vendor about their handmade cheese.",
                "Negotiate on a Provençal tablecloth.",
                "Buy a gift and ask if they can wrap it.",
            ],
            "quiz": [
                {"question": "What does 'fait main' mean?", "options": ["Made in France", "Handmade", "Fresh today", "Final price"], "answer": 1},
                {"question": "How do you politely ask for a better price?", "options": ["C'est trop cher !", "Vous pouvez faire un geste sur le prix ?", "Je ne veux pas ça", "C'est combien ?"], "answer": 1},
            ],
        },
    },
    {
        "title": "Une Soirée — Making Friends at a Party",
        "subtitle": "French small talk and socializing made easy",
        "description": "Navigate a French social event — make introductions, find common interests, share opinions, and keep a conversation flowing naturally.",
        "category": "roleplay",
        "difficulty": "B1",
        "order": 20,
        "duration_minutes": 15,
        "xp_reward": 25,
        "thumbnail_emoji": "🎉",
        "is_free": False,
        "audio_script": "On s'est déjà rencontrés ? Tu es ami avec qui ici ? Qu'est-ce que tu fais dans la vie ? Tu aimes la musique ?",
        "scenario_prompt": "You're at a French house party. Make conversation with someone you don't know — find out about their life, share yours, and discover common interests.",
        "content": {
            "vocabulary": [
                {"word": "se rencontrer", "translation": "to meet each other", "pronunciation": "suh rahn-kohn-TRAY"},
                {"word": "avoir en commun", "translation": "to have in common", "pronunciation": "ah-VWAHR ahn koh-MUHN"},
                {"word": "passionné(e) par", "translation": "passionate about", "pronunciation": "pah-syoh-NAY par"},
                {"word": "tu viens d'où ?", "translation": "where are you from?", "pronunciation": "tew vyan DOO"},
                {"word": "que fais-tu ?", "translation": "what do you do?", "pronunciation": "kuh fay-TU"},
                {"word": "c'est sympa", "translation": "that's nice / cool", "pronunciation": "say SAN-pah"},
                {"word": "on devrait", "translation": "we should", "pronunciation": "ohn duh-VRAY"},
                {"word": "échanger les numéros", "translation": "exchange numbers", "pronunciation": "ay-shahn-ZHAY lay nue-may-ROH"},
            ],
            "phrases": [
                {"french": "On s'est déjà rencontrés ?", "english": "Have we met before?"},
                {"french": "Tu es ami avec l'hôte ?", "english": "Are you friends with the host?"},
                {"french": "Qu'est-ce que tu fais dans la vie ?", "english": "What do you do for a living?"},
                {"french": "Je suis passionné(e) de cuisine.", "english": "I'm passionate about cooking."},
                {"french": "Ah vraiment ? Moi aussi !", "english": "Oh really? Me too!"},
                {"french": "On devrait se retrouver un de ces jours.", "english": "We should meet up one of these days."},
            ],
            "grammar_notes": "The passé composé is used for completed past actions: 'On s'est rencontrés' (We met). The present tense + question words handle most small talk: 'Tu aimes...?' (Do you like...?), 'Tu fais quoi...?' (What do you do...?).",
            "speaking_prompts": [
                "Start a conversation with a stranger at a party.",
                "Find three things you have in common.",
                "Invite the person to continue the conversation over coffee.",
            ],
            "quiz": [
                {"question": "How do you ask 'what do you do for a living'?", "options": ["Tu viens d'où ?", "Qu'est-ce que tu fais dans la vie ?", "On s'est rencontrés ?", "Tu es passionné ?"], "answer": 1},
                {"question": "What does 'c'est sympa' mean?", "options": ["That's boring", "That's expensive", "That's nice / cool", "That's strange"], "answer": 2},
            ],
        },
    },
    {
        "title": "Chez le Médecin — At the Doctor's",
        "subtitle": "Describe symptoms and get medical help in French",
        "description": "When traveling or living in France, knowing how to describe health problems to a doctor is essential. Learn medical vocabulary and how to explain what's wrong.",
        "category": "roleplay",
        "difficulty": "B1",
        "order": 21,
        "duration_minutes": 15,
        "xp_reward": 25,
        "thumbnail_emoji": "🏥",
        "is_free": False,
        "audio_script": "J'ai mal à la tête. J'ai de la fièvre. Depuis quand ? Je me sens pas bien. J'ai besoin d'une ordonnance.",
        "scenario_prompt": "You're sick and visiting a French doctor. Describe your symptoms, answer questions about your health, and understand the doctor's advice.",
        "content": {
            "vocabulary": [
                {"word": "j'ai mal à", "translation": "I have pain in / my ... hurts", "pronunciation": "zhay mal ah"},
                {"word": "la tête", "translation": "the head", "pronunciation": "lah TET"},
                {"word": "la fièvre", "translation": "fever", "pronunciation": "lah FYEV-ruh"},
                {"word": "depuis", "translation": "since / for (time)", "pronunciation": "duh-PWEE"},
                {"word": "l'ordonnance", "translation": "the prescription", "pronunciation": "lor-doh-NAHNS"},
                {"word": "la pharmacie", "translation": "the pharmacy", "pronunciation": "lah far-mah-SEE"},
                {"word": "se sentir", "translation": "to feel (oneself)", "pronunciation": "suh sahn-TEER"},
                {"word": "allergique", "translation": "allergic", "pronunciation": "ah-lair-ZHEEK"},
            ],
            "phrases": [
                {"french": "J'ai mal à la tête.", "english": "I have a headache. (my head hurts)"},
                {"french": "J'ai de la fièvre depuis deux jours.", "english": "I've had a fever for two days."},
                {"french": "Je me sens pas bien.", "english": "I don't feel well."},
                {"french": "J'ai besoin d'une ordonnance.", "english": "I need a prescription."},
                {"french": "Je suis allergique à la pénicilline.", "english": "I'm allergic to penicillin."},
                {"french": "C'est grave ?", "english": "Is it serious?"},
            ],
            "grammar_notes": "'Avoir mal à' + body part = to have pain in. 'Depuis' + duration indicates how long something has been happening: 'J'ai mal depuis hier' (I've been in pain since yesterday).",
            "speaking_prompts": [
                "Describe three symptoms to the doctor.",
                "Tell the doctor about your medical history.",
                "Ask the doctor how to take your medication.",
            ],
            "quiz": [
                {"question": "How do you say 'my stomach hurts'?", "options": ["J'ai mal au ventre", "J'ai de la fièvre", "Je me sens bien", "J'ai mal à la tête"], "answer": 0},
                {"question": "What does 'depuis' indicate in 'J'ai mal depuis 3 jours'?", "options": ["The severity", "How long it has been going on", "The location", "The treatment"], "answer": 1},
            ],
        },
    },
]


class Command(BaseCommand):
    help = 'Seed the database with French language and 21 lessons'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Delete all existing lessons before seeding',
        )

    def handle(self, *args, **options):
        if options['reset']:
            deleted, _ = Lesson.objects.filter(language__code='fr').delete()
            self.stdout.write(self.style.WARNING(f'Deleted {deleted} existing French lessons.'))

        # Create or update French language
        french, created = Language.objects.update_or_create(
            code='fr',
            defaults={
                'name': 'French',
                'native_name': 'Français',
                'flag_emoji': '🇫🇷',
                'tts_locale': 'fr-FR',
                'is_active': True,
                'order': 1,
            },
        )
        action = 'Created' if created else 'Updated'
        self.stdout.write(f'{action} language: French (fr)')

        # Seed companion languages (placeholders for future expansion)
        companions = [
            {'code': 'es', 'name': 'Spanish', 'native_name': 'Español', 'flag_emoji': '🇪🇸', 'tts_locale': 'es-ES', 'order': 2},
            {'code': 'de', 'name': 'German', 'native_name': 'Deutsch', 'flag_emoji': '🇩🇪', 'tts_locale': 'de-DE', 'order': 3},
            {'code': 'it', 'name': 'Italian', 'native_name': 'Italiano', 'flag_emoji': '🇮🇹', 'tts_locale': 'it-IT', 'order': 4},
            {'code': 'pt', 'name': 'Portuguese', 'native_name': 'Português', 'flag_emoji': '🇵🇹', 'tts_locale': 'pt-PT', 'order': 5},
        ]
        for lang_data in companions:
            Language.objects.update_or_create(
                code=lang_data['code'],
                defaults={**lang_data, 'is_active': False},
            )
        self.stdout.write(f'Created {len(companions)} placeholder languages (inactive).')

        # Seed lessons
        created_count = 0
        skipped_count = 0

        for lesson_data in FRENCH_LESSONS:
            _, was_created = Lesson.objects.update_or_create(
                language=french,
                title=lesson_data['title'],
                defaults={
                    **lesson_data,
                    'language': french,
                },
            )
            if was_created:
                created_count += 1
            else:
                skipped_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSeeding complete!\n'
                f'   Created: {created_count} lessons\n'
                f'   Updated: {skipped_count} lessons\n'
                f'   Total:   {Lesson.objects.filter(language__code="fr").count()} French lessons\n'
            )
        )
