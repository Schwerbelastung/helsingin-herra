// Helsinki Tycoon - Helsingin Sanomat Newspaper System
const Newspaper = (() => {

    const MONTH_NAMES = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    // Filler stories — pure flavor, no gameplay relevance
    const FILLER_STORIES = [
        {
            title: 'HELSINKI VOTED MOST LIVABLE CITY IN NORDICS',
            text: 'For the third consecutive year, Helsinki has topped the Nordic Livability Index, beating out Copenhagen and Stockholm. Residents cite the excellent public transport, access to nature, and the world\'s best tap water as key factors. "Where else can you swim in the sea, pick blueberries in the forest, and attend a tech conference all in the same day?" asked one enthusiastic local.',
        },
        {
            title: 'RECORD NUMBER OF SAUNAS BUILT THIS YEAR',
            text: 'The Finnish Sauna Society reports that Helsinki saw 47 new saunas constructed this year, bringing the city\'s total to an estimated 1.2 million — roughly two for every resident. "We\'re not surprised," said the Society\'s chairman, emerging from a 90-degree löyly. "You can never have too many saunas. That is a scientific fact."',
        },
        {
            title: 'MYSTERIOUS SHORTAGE OF SALMIAKKI ALARMS NATION',
            text: 'Finland\'s beloved salty liquorice has become increasingly difficult to find on store shelves, sparking panic buying and heated social media debates. The National Emergency Supply Agency has assured citizens that strategic reserves of salmiakki are sufficient. "There is no need to hoard," a spokesperson stated, before nervously checking their own pockets.',
        },
        {
            title: 'TRAM LINE 3 COMPLETES JOURNEY WITHOUT SINGLE DELAY',
            text: 'In what experts are calling a "statistical miracle," Helsinki\'s notoriously unpunctual Tram Line 3 completed its full route without a single delay last Tuesday. Passengers were so shocked that several refused to exit, convinced they had boarded the wrong tram. HSL is investigating whether the event can be replicated.',
        },
        {
            title: 'OODI LIBRARY BREAKS LENDING RECORD AGAIN',
            text: 'Helsinki\'s beloved Oodi Library has shattered its own lending record, with over 3 million items borrowed this year. The most popular item was, surprisingly, not a book but a sewing machine. "Finns love making things," explained head librarian Marja Korhonen. "Also, have you seen the price of new curtains?"',
        },
        {
            title: 'SCIENTISTS CONFIRM: HELSINKI SUNSETS GETTING MORE BEAUTIFUL',
            text: 'Researchers at the University of Helsinki have published a peer-reviewed study confirming what locals have long suspected: sunsets over the archipelago are measurably more beautiful than a decade ago. The study attributes this to improved air quality and a "slight increase in dramatic cloud formations." Critics say the methodology was "suspiciously Finnish."',
        },
        {
            title: 'SEAGULL POPULATION REACHES ALL-TIME HIGH',
            text: 'Helsinki\'s seagull population has hit a record 15,000 breeding pairs, according to the city\'s environmental services. The birds have become increasingly bold, with several incidents of ice cream theft reported near Market Square. The city council is considering a "Seagull Awareness Campaign," though early focus group testing suggests citizens are already painfully aware.',
        },
        {
            title: 'KALLIO BLOCK PARTY NAMED BEST STREET FESTIVAL',
            text: 'The annual Kallio Block Party has been named Finland\'s best street festival by Festivaali Magazine. "It\'s the only event where you can see a punk band, buy artisan kombucha, and get a tattoo all within 50 meters," the judges noted. Local residents expressed mixed feelings about the award, primarily concerning parking.',
        },
        {
            title: 'HELSINKI CATHEDRAL STEPS STILL FINLAND\'S BEST LUNCH SPOT',
            text: 'A nationwide survey has confirmed what thousands of office workers already knew: the steps of Helsinki Cathedral remain the country\'s most popular lunchtime destination. An estimated 2,000 people sit on the steps daily during summer months, consuming an average of 800 sandwiches, 400 salads, and an improbable quantity of coffee.',
        },
        {
            title: 'LOCAL MAN COMPLETES SWIMMING IN EVERY HELSINKI BAY',
            text: 'Retired engineer Pekka Virtanen, 67, has completed his decade-long quest to swim in every bay, inlet, and cove within Helsinki city limits — a total of 43 bodies of water. "The coldest was Vanhankaupunginlahti in March," he recalled. "The dirtiest was also Vanhankaupunginlahti in March." He plans to begin a similar project in Espoo.',
        },
        {
            title: 'MARKET SQUARE HERRING DECLARED NATIONAL TREASURE',
            text: 'The Ministry of Culture has officially designated Market Square\'s traditional herring stands as a National Cultural Treasure. "These stands have been selling herring since 1818," the minister noted. "That\'s over 200 years of Finns staring at fish before reluctantly choosing the same one they always get." Stand owners celebrated with a modest nod.',
        },
        {
            title: 'SUOMENLINNA FERRY SETS PUNCTUALITY RECORD',
            text: 'The Suomenlinna ferry has achieved a 99.7% on-time record this year, making it the most punctual ferry service in Europe. The only late arrival was attributed to a seal sleeping on the dock. "We waited for it to move," explained the captain. "You don\'t rush a seal."',
        },
        {
            title: 'KAMPPI CHAPEL OF SILENCE TOO POPULAR FOR SILENCE',
            text: 'The iconic wooden Chapel of Silence in Kamppi has become so popular with tourists that actual silence has become nearly impossible. "There\'s always someone whispering about how quiet it is," complained regular visitor Antti Laakso. The chapel administration is considering a "Silence About The Silence" campaign.',
        },
        {
            title: 'HELSINKI ICE SWIMMERS BREAK WINTER RECORD',
            text: 'Over 3,000 Helsinki residents took part in organized ice swimming this winter, a new city record. Medical professionals continue to insist the practice has health benefits, while participants say they do it "because it makes the sauna feel even better." The youngest swimmer was 8. The oldest was 91. Both described the experience as "refreshing."',
        },
        {
            title: 'ARABIA DISTRICT POTTERY SELLS FOR RECORD SUM AT AUCTION',
            text: 'A vintage Arabia ceramic vase, discovered in a Kallio flea market for €3, has sold at international auction for €47,000. The seller, who wishes to remain anonymous, said she "had a feeling about it." Art experts confirmed the piece is a rare 1952 Kaj Franck prototype. The flea market vendor has declined to comment.',
        },
        {
            title: 'CITY CONSIDERS BUILDING TUNNEL TO TALLINN',
            text: 'The Helsinki-Tallinn tunnel project has resurfaced in city planning discussions, with engineers claiming new boring technology could make the 80-kilometer undersea link financially viable. "We could be in Tallinn in 30 minutes," an optimistic engineer declared. Skeptics note that the project has been "about to start" since 1994.',
        },
        {
            title: 'ESPLANADI PARK SQUIRRELS LEARN TO USE CROSSWALKS',
            text: 'Biologists at the University of Helsinki have documented a remarkable phenomenon: squirrels in Esplanadi Park appear to have learned to use pedestrian crosswalks. "They wait for the green man, or at least for a large group of humans to cross with," explained researcher Dr. Tuomas Kivi. "It\'s either extraordinary adaptation or extraordinary coincidence."',
        },
        {
            title: 'LINNANMÄKI ROLLER COASTER CELEBRATES 70TH BIRTHDAY',
            text: 'The beloved Vuoristorata wooden roller coaster at Linnanmäki amusement park has turned 70, making it one of the oldest operating coasters in the world. "She creaks a bit more than she used to," admitted the head of maintenance, "but then again, so do most 70-year-olds." Celebrations included free rides and a ceremonial first car reserved for the coaster\'s oldest living rider.',
        },
        {
            title: 'FINNISH COFFEE CONSUMPTION STILL WORLD\'S HIGHEST',
            text: 'New figures confirm that Finland remains the world\'s top coffee consumer per capita, with the average Helsinkian drinking 4.1 cups per day. "Only 4.1? That seems low," said barista Emilia Saarinen, pouring her sixth espresso of the morning. Health officials have stopped trying to recommend moderation and now simply advise "good quality beans."',
        },
        {
            title: 'DESIGN DISTRICT SHOP SELLS SINGLE CHAIR FOR €12,000',
            text: 'A minimalist wooden chair by a young Finnish designer has sold for €12,000 at a Design District gallery, sparking debate about the nature of furniture. "It\'s not a chair, it\'s a statement," explained the gallery owner. "The statement being that some people have €12,000 to spend on a chair," responded a commenter online. The designer has already sold out of the next production run.',
        },
        {
            title: 'ALLAS SEA POOL HOSTS MIDNIGHT SWIMMING CHAMPIONSHIP',
            text: 'Helsinki\'s Allas Sea Pool held its first-ever Midnight Swimming Championship during the summer solstice, drawing 200 competitors who raced in broad daylight at 1 AM. "It\'s the only race where the sun never sets on you," joked organizer Mikko Rantala. The winner completed 50 meters in 28 seconds and credited "the endless light and pure spite."',
        },
        {
            title: 'HAM MUSEUM EXHIBIT CAUSES VIEWERS TO QUESTION REALITY',
            text: 'A new installation at HAM Helsinki Art Museum features an empty white room with a single potato on a pedestal. Critics are divided. "It\'s a profound commentary on sustenance and simplicity," wrote one reviewer. "It\'s a potato," wrote another. The museum reports it has become their most discussed exhibit this year. The potato has been replaced twice.',
        },
        {
            title: 'CITY BIKES CLOCKED 4 MILLION TRIPS THIS SEASON',
            text: 'Helsinki\'s bright yellow city bikes logged over 4 million trips this season, with the most popular route being from Kamppi to Kaivopuisto — a scenic downhill ride that, users note, is considerably less enjoyable in the return direction. The bikes are now being winterized, a process that one maintenance worker described as "putting 3,000 bikes to bed."',
        },
        {
            title: 'LÖYLY SAUNA NAMED WORLD\'S MOST BEAUTIFUL SAUNA',
            text: 'Architecture Digest has named Helsinki\'s Löyly the most beautiful sauna in the world, praising its sculptural wooden exterior and sea-facing terrace. Locals point out that while it is indeed beautiful, the real test of a sauna is the löyly — the steam. "Pretty walls don\'t make steam," grumbled one traditionalist from his undecorated backyard sauna.',
        },
        {
            title: 'USPENSKI CATHEDRAL DRAWS RECORD TOURIST CROWDS',
            text: 'The striking red-brick Uspenski Cathedral in Katajanokka welcomed its one millionth visitor this year, cementing its position as Helsinki\'s most photographed building. "Everyone takes the same photo from the same angle," noted a nearby souvenir vendor. "I\'ve seen it four hundred thousand times. It\'s still a good photo, though."',
        },
        {
            title: 'MYSTERIOUS MOOMIN MURAL APPEARS IN SÖRNÄINEN',
            text: 'Residents of Sörnäinen woke to discover a massive, expertly painted Moomin mural covering the side of an apartment building. No one has claimed responsibility. "It appeared overnight, which is impressive given it\'s three stories tall," said building manager Helena Mäki. The city has declared it an unofficial landmark. Tove Jansson\'s estate sent a thumbs-up emoji.',
        },
        {
            title: 'VAPPU CELEBRATIONS PRODUCE RECORD AMOUNT OF SIMA',
            text: 'This year\'s Vappu festivities saw an estimated 800,000 liters of homemade sima consumed across Helsinki, a new national record. Hospital emergency rooms reported a corresponding uptick in "mead-related overenthusiasm." The traditional tippaleipä funnel cakes sold out at most bakeries by 10 AM. "We underestimated Finland again," said one baker.',
        },
        {
            title: 'HELSINKI ZOO WELCOMES BABY SNOW LEOPARD',
            text: 'Korkeasaari Zoo has announced the birth of a rare snow leopard cub, the first born in Finland in 15 years. The cub, who has not yet been named, has already become a social media sensation. "She\'s very fluffy and very angry," said her keeper. "Classic Finnish temperament." A public naming contest has attracted over 40,000 suggestions.',
        },
        {
            title: 'STOCKMANN CLOCK REPAIRED AFTER 47 YEARS OF BEING 3 MINUTES FAST',
            text: 'The iconic Stockmann department store clock, a beloved Helsinki meeting point, has been corrected after decades of running three minutes fast. Reaction has been overwhelmingly negative. "Now I\'m actually late instead of thinking I\'m late," complained longtime user Jari Koskinen. A petition to restore the three-minute lead has gathered 12,000 signatures.',
        },
        {
            title: 'UNDERGROUND TUNNELS EXPANDED BY ANOTHER 2 KILOMETERS',
            text: 'Helsinki\'s vast underground tunnel network, already the most extensive in the world for a city its size, has been expanded by another 2 km this year. The tunnels now connect major buildings across the city center, allowing residents to avoid winter weather entirely. "I haven\'t been outside since November," said one downtown office worker, not entirely joking.',
        },
        {
            title: 'FINNISH TANGO FESTIVAL DRAWS INTERNATIONAL CROWD',
            text: 'The annual Finnish Tango Festival attracted visitors from 23 countries this year, all eager to experience Finland\'s unique take on the Argentine dance. "Finnish tango is slower, sadder, and performed in near-total silence," explained instructor Raija Holm. "It\'s basically the most Finnish thing you can do standing up." Attendance was up 18% from last year.',
        },
        {
            title: 'SOMPASAUNA REGULARS REFUSE TO ACKNOWLEDGE FAME',
            text: 'The self-built, volunteer-run Sompasauna on Helsinki\'s eastern waterfront has been featured in The New York Times, The Guardian, and a Japanese travel documentary, yet its regulars remain stubbornly unimpressed. "It\'s just a sauna," shrugged one regular, stoking the fire. "The whole point is that it\'s not fancy." The sauna has no website and prefers it that way.',
        },
        {
            title: 'RUOHOLAHTI CANAL DUCKS COUNTED: EXACTLY 247',
            text: 'The annual Helsinki duck census has concluded, with Ruoholahti Canal hosting exactly 247 mallards — up from 231 last year. "The canal offers excellent bread-throwing conditions," explained ornithologist Dr. Pirkko Lehto. City officials reminded residents that bread is actually harmful to ducks and suggested offering oats instead. Residents continued throwing bread.',
        },
        {
            title: 'HSL BUS DRIVER WINS NATIONAL POLITENESS AWARD',
            text: 'Helsinki bus driver Markku Salonen has won Finland\'s National Politeness Award for greeting every passenger with a "Hyvää päivää" and waiting for elderly riders to sit before departing. "He once held the bus for a woman running from 200 meters away," marveled a regular passenger. Salonen said he was "just doing his job" and seemed mildly distressed by the attention.',
        },
        {
            title: 'TÖÖLÖNLAHTI SKATING RINK OPENS TO LARGEST CROWD EVER',
            text: 'The outdoor skating rink at Töölönlahti opened this winter to its largest opening-day crowd in history, with over 2,500 skaters taking to the ice. The most popular activity was "standing on the ice and taking selfies," followed by "actual skating" in a distant second. Three marriage proposals were observed, all of which were accepted — possibly because saying no on ice is logistically difficult.',
        },
        {
            title: 'KAUPPATORI FISH VENDOR CELEBRATES 50 YEARS IN BUSINESS',
            text: 'Eino Leppänen, 74, has celebrated his 50th year selling fish at Market Square. "I\'ve sold herring to four presidents, two kings, and one pope," he claims, though the papal visit remains unconfirmed. When asked about retirement, Leppänen scoffed. "Retire to what? My wife would make me organize the garage. I\'d rather sell fish until I become one."',
        },
        {
            title: 'ELECTRIC SCOOTER GRAVEYARD DISCOVERED IN TÖÖLÖ BAY',
            text: 'Divers conducting a routine environmental survey discovered over 80 electric scooters at the bottom of Töölö Bay, making it Helsinki\'s largest underwater vehicle collection. The scooter companies were surprisingly philosophical. "They\'re free-range vehicles," said one spokesperson. "Sometimes they migrate." The cleanup cost is estimated at €40,000.',
        },
        {
            title: 'SLUSH TECH CONFERENCE ATTENDEES OUTNUMBER RESIDENTS OF KLUUVI',
            text: 'This year\'s Slush startup conference drew 25,000 attendees to Messukeskus, briefly making the conference venue one of Helsinki\'s most densely populated districts. "The ratio of hoodies to business suits was approximately 17 to 1," reported one attendee. A record 347 startups pitched their ideas, of which approximately 340 described themselves as "AI-powered."',
        },
        {
            title: 'WORLD SAUNA CHAMPIONSHIPS REVIVAL PROPOSED',
            text: 'A group of sauna enthusiasts has proposed reviving the World Sauna Championships, discontinued in 2010 after a contestant was hospitalized. The new format would feature "reasonable temperatures" and mandatory hydration breaks. "We want to celebrate endurance, not recklessness," organizers stated. Finnish sauna purists dismissed the reformed version as "a warm room with rules."',
        },
        {
            title: 'PIKKU HUOPALAHTI RESIDENTS PETITION FOR OWN POSTAL CODE',
            text: 'Residents of the small Helsinki neighborhood Pikku Huopalahti have submitted a formal petition for their own postal code, tired of being lumped in with neighboring Munkkiniemi. "We have our own identity," declared petition organizer Sanna Toivonen. "We have a daycare, a playground, and at least two restaurants." The postal service is reviewing the request with what sources describe as "polite bewilderment."',
        },
        {
            title: 'TEMPPELIAUKIO CHURCH ACOUSTICS STUN VISITING MUSICIANS',
            text: 'A visiting orchestra from Vienna declared Temppeliaukio Rock Church to have "the most extraordinary natural acoustics we have ever encountered." The conductor was seen pressing his ear against the granite walls. "The rock sings back to you," he whispered. Regular churchgoers seemed pleased but noted that "it\'s always been like that."',
        },
        {
            title: 'AMBITIOUS PLAN TO CONNECT EVERY ISLAND IN HELSINKI ARCHIPELAGO',
            text: 'City planners have unveiled a proposal to connect all 330 islands in the Helsinki archipelago with a network of bridges, ferries, and underwater tunnels. The estimated cost is €4.8 billion. The estimated completion date is "optimistic." Island residents have mixed feelings. "I moved to an island specifically to get away from people," said one. "Now they want to build a bridge to my door."',
        },
        {
            title: 'NATIONAL ARCHIVE FINDS LOST ALVAR AALTO SKETCHES',
            text: 'Archivists at the National Library have discovered a folder of previously unknown Alvar Aalto sketches tucked inside a 1937 edition of the Helsinki telephone directory. The sketches depict an unrealized concert hall shaped like a wave. "It\'s extraordinary," said architecture professor Liisa Hautamäki. "Though knowing Aalto, the wavy shape might just mean the paper got wet."',
        },
        {
            title: 'JÄTKÄSAARI CONSTRUCTION PROJECTS NOW VISIBLE FROM SPACE',
            text: 'Satellite imagery confirms that the sheer density of construction cranes in Jätkäsaari is now detectable from orbit. "There are 14 active tower cranes in a 500-meter radius," reported one construction firm. Residents have adapted by using the cranes for navigation. "Take a left at the blue crane, then go straight until you hit the yellow one," is now a common direction.',
        },
        {
            title: 'HELSINKI RESIDENTS CONSUME 8 MILLION KORVAPUUSTI ANNUALLY',
            text: 'A bakery industry report reveals that Helsinki residents consume approximately 8 million korvapuusti (cinnamon rolls) per year — roughly four per person per month. "The number is probably higher," admitted the report\'s author. "Many korvapuusti are consumed in secret, at desks, over sinks, and in parked cars. These are difficult to track."',
        },
        {
            title: 'RARE WHITE MOOSE SPOTTED IN CENTRAL PARK',
            text: 'A rare white moose has been spotted in Helsinki\'s Central Park, causing excitement among wildlife enthusiasts and mild panic among joggers. The albino bull, estimated to weigh 500 kg, was photographed calmly eating birch leaves near Paloheinä. "He looked at me like I was the one who didn\'t belong," reported photographer Ville Heikkinen.',
        },
        {
            title: 'CITY PLANS NEW DISTRICT BUILT ENTIRELY OF WOOD',
            text: 'Helsinki has announced plans for a new residential district constructed entirely from Finnish timber, making it the largest wooden city district in modern Europe. "Wood is sustainable, beautiful, and very Finnish," said the project lead. When asked about fire safety, she paused briefly. "We have excellent fire departments." The district will house an estimated 5,000 residents by 2030.',
        },
        {
            title: 'KAURISMÄKI FILM SHOT ENTIRELY ON ONE HELSINKI STREET',
            text: 'Director Aki Kaurismäki\'s latest film was shot entirely on a single 200-meter stretch of Hämeentie in Sörnäinen. The film features no dialogue, three bars, and a dog. "It\'s my most ambitious project," Kaurismäki stated, deadpan. Critics are already calling it "a masterpiece of Finnish minimalism." The dog has been nominated for a Jussi Award.',
        },
        {
            title: 'CITIZEN SURVEY: HAPPIEST SPOT IN HELSINKI IS A BENCH IN KAIVOPUISTO',
            text: 'A university happiness study using GPS-tracked mood surveys has identified a specific park bench in Kaivopuisto as Helsinki\'s happiest location. The bench, which faces the sea and receives afternoon sun, has since become a minor pilgrimage site. "I sat on the bench," reported one visitor. "I did feel slightly happier. Could be the bench. Could be the ice cream I was eating."',
        },
        {
            title: 'RECORD YEAR FOR AURORA BOREALIS SIGHTINGS IN CAPITAL',
            text: 'Helsinki experienced an unusual 12 visible aurora displays this year, far exceeding the typical 1-2 for this latitude. Astronomers attribute the increase to a peak in the solar cycle. "Every time the sky turns green, the entire city goes outside in their pajamas," observed one astronomer. Instagram posts tagged #helsinkiaurora exceeded 200,000.',
        },
        // --- batch 6 ---
        {
            title: 'HELSINKI RANKED WORLD\'S BEST CITY FOR REMOTE WORKERS',
            text: 'A global survey of digital nomads has ranked Helsinki as the world\'s best city for remote work, citing reliable Wi-Fi, abundant coworking spaces, and "an almost suspicious number of good coffee shops." The city narrowly beat Lisbon, which was docked points for "too much sunshine, which causes screen glare." Helsinki officials accepted the award via video call from a café.',
        },
        {
            title: 'MYSTERY OF THE SENATE SQUARE PIANO SOLVED',
            text: 'The anonymous pianist who has been performing Chopin nocturnes on Senate Square at 3 AM for the past six months has been identified as a retired mathematics professor from Töölö. "I couldn\'t sleep," explained Professor Kalevi Nurmi, 72. "And my apartment walls are thin. The square seemed like the polite option." He has been offered a residency at the Music Centre, which he declined. "The acoustics of the square are better."',
        },
        {
            title: 'HERNESAARI DEVELOPMENT DRAWS BOTH PRAISE AND PROTEST',
            text: 'Plans for the new Hernesaari waterfront district continue to divide Helsinkians. Supporters praise the mix of housing, culture, and public sauna access. Critics have formed a group called "Save Our Shoreline," whose members have been spotted planting wildflowers on the construction site at night. "We\'re not protesters," they insist. "We\'re gardeners with strong opinions."',
        },
        {
            title: 'ANNUAL WIFE-CARRYING RACE QUALIFIERS HELD IN KALLIO',
            text: 'The Helsinki qualifiers for the World Wife-Carrying Championship drew 34 couples to Kallio\'s Bear Park, where participants navigated a 250-meter obstacle course while carrying their partner. The winning couple completed the course in 58 seconds. "The secret is trust," said the winner. "Also, my wife weighs 52 kilos." His wife added: "The secret is that I do all the steering."',
        },
        {
            title: 'FINNISH BREAD NAMED UNESCO INTANGIBLE HERITAGE',
            text: 'Traditional Finnish rye bread, or ruisleipä, has been added to UNESCO\'s list of Intangible Cultural Heritage. Helsinki bakeries reported a 40% surge in rye bread sales following the announcement. "We\'ve been saying this for centuries," said one baker in Hakaniemi Market Hall. "Rye bread is not just food. It\'s identity." A subsequent debate about whether Karelian pies should also qualify has been described as "intense."',
        },
        {
            title: 'COMMUTER FERRY TO LAUTTASAARI SEES RECORD RIDERSHIP',
            text: 'The waterbus connecting Lauttasaari to the city center has reported its busiest year ever, with over 200,000 passengers. "People discover they can commute by boat and they never go back to the metro," explained the ferry operator. "Something about arriving at work slightly windswept and smelling of sea air makes the day better." The service will add a second vessel next year.',
        },
        {
            title: 'MASSIVE BLUEBERRY HARVEST OVERWHELMS HELSINKI MARKETS',
            text: 'An unusually warm and wet August has produced what foragers are calling "the blueberry harvest of the century." Helsinki\'s markets are overflowing with buckets of wild blueberries, and prices have dropped to €2 per liter. "My freezer is full. My neighbor\'s freezer is full. I\'m considering renting a storage unit," reported one enthusiastic picker from Paloheinä.',
        },
        {
            title: 'HELSINKI AIRPORT SAUNA VOTED WORLD\'S BEST AIRPORT AMENITY',
            text: 'The sauna at Helsinki-Vantaa Airport has won Skytrax\'s award for Best Airport Amenity for the fifth consecutive year. Travelers praised the ability to "have a proper löyly between connecting flights." One Japanese businessman reported that he now routes all European trips through Helsinki specifically for the sauna. "It\'s a two-hour layover," he said. "Ninety minutes in the sauna, thirty for dressing."',
        },
        {
            title: 'KULOSAARI RESIDENTS FORM NEIGHBORHOOD BOOK EXCHANGE',
            text: 'Residents of the quiet island neighborhood of Kulosaari have established a free book exchange in a converted phone booth. Within three months, over 2,000 books have passed through the tiny library. The most frequently exchanged genre is Nordic crime fiction, followed closely by cookbooks. "We had to add a second shelf for the Wallander novels alone," said organizer Tuula Mäkinen.',
        },
        {
            title: 'HELSINKI DAY CELEBRATIONS DRAW RECORD TURNOUT',
            text: 'Helsinki Day on June 12 saw an estimated 400,000 people participating in events across the city, from free concerts at Kaivopuisto to guided architecture walks in Töölö. The most popular event was a communal breakfast on Esplanadi, where 3,000 residents ate porridge together. "Only in Finland would thousands of people wake up early to eat porridge in silence with strangers," noted one amused tourist.',
        },
        // --- batch 7 ---
        {
            title: 'MYSTERIOUS INCREASE IN HEDGEHOG SIGHTINGS ACROSS CITY',
            text: 'Helsinki\'s Urban Nature team has documented a 300% increase in hedgehog sightings this year, with the prickly creatures appearing in gardens, parks, and even one office building lobby in Ruoholahti. "They seem to be thriving," said wildlife officer Sami Peltonen. "Though I\'m not entirely sure why. Maybe they just like the vibe." Residents are reminded not to feed hedgehogs cat food, which many have been doing anyway.',
        },
        {
            title: 'SUOMENLINNA TUNNEL PROJECT REVEALS VIKING-ERA ARTIFACTS',
            text: 'Construction workers upgrading utility tunnels on Suomenlinna have uncovered a cache of Viking-era artifacts, including silver coins, a bronze brooch, and what archaeologists believe is a very old fishhook. "This confirms that the islands were used as a trading post centuries before the fortress was built," said lead archaeologist Dr. Hanna Rautio. The fishhook has been tentatively dated to 1050 AD. "Someone lost a big one that day," she added.',
        },
        {
            title: 'PASILA TOWER CRANE OPERATOR BECOMES INSTAGRAM SENSATION',
            text: 'Juhani Lepistö, a tower crane operator working on the Tripla development in Pasila, has amassed 180,000 Instagram followers with his daily sunrise photos taken from 70 meters above Helsinki. "The light at 5 AM is incredible up here," he said. "Also very cold in winter." His most-liked post, a panoramic shot of the frozen sea at dawn, received 45,000 likes and a comment from the mayor.',
        },
        {
            title: 'KRUUNUNHAKA COBBLESTONES TO BE INDIVIDUALLY NUMBERED',
            text: 'In what critics are calling "peak Helsinki bureaucracy," the city has announced plans to individually catalog and number every cobblestone on three historic streets in Kruununhaka. "Each stone has heritage value," explained a city preservation officer. "We need to know where they are." The project is expected to take two years and involve approximately 14,000 cobblestones. Local residents have offered to help. "We have nothing better to do in winter," they said.',
        },
        {
            title: 'VALLILA MURAL TRAIL BECOMES CITY\'S THIRD MOST POPULAR WALKING ROUTE',
            text: 'The self-guided mural trail through Vallila\'s colorful wooden houses has surpassed the Suomenlinna walk as Helsinki\'s third most popular tourist route, after the Design District loop and the Esplanadi-to-Market-Square stroll. "People come for the murals and stay for the cinnamon buns," said one café owner on the route, whose daily korvapuusti output has tripled since the trail was established.',
        },
        {
            title: 'REINDEER SPOTTED IN EASTERN HELSINKI, PUZZLING AUTHORITIES',
            text: 'A lone reindeer was spotted wandering through Kontula on Tuesday morning, approximately 800 kilometers south of its expected habitat. The animal appeared healthy and unfazed by urban life, calmly grazing on a traffic roundabout before being corralled by animal control. "We have no idea how it got here," admitted a baffled wildlife officer. "The train seems unlikely but not impossible."',
        },
        {
            title: 'CHAMPION BARISTA PUTS HELSINKI ON GLOBAL COFFEE MAP',
            text: 'Helsinki barista Noora Heikkinen has won the World Barista Championship, making Finland the first country to claim both the highest per-capita coffee consumption and the world\'s best barista. "In Finland, coffee is not a trend — it\'s infrastructure," Heikkinen said in her acceptance speech. The city has declared a "Coffee Week" in her honor, which locals note is indistinguishable from any other week.',
        },
        {
            title: 'PLAN TO TURN OLD METRO CARS INTO RESTAURANTS APPROVED',
            text: 'Helsinki City Council has approved a plan to convert decommissioned metro cars into pop-up restaurants along the waterfront. The first car, repainted in bright yellow, will serve ramen near Kalasatama. "The seats are already there, the windows are great, and the ventilation is excellent," said the project\'s architect. Purists have protested, arguing the cars should be preserved. "Preserved how?" asked one council member. "As restaurants."',
        },
        {
            title: 'ANNUAL PIKKUJOULUT SEASON BEGINS EARLIER THAN EVER',
            text: 'Helsinki\'s annual pikkujoulut (pre-Christmas party) season has begun in late October this year, a full three weeks earlier than the traditional November start. Restaurant bookings for Friday nights through December are already 90% full. "We started booking in September," said one HR manager. "If you wait until November, you\'re having your pikkujoulut in a kebab shop." Kebab shops report increased inquiries.',
        },
        {
            title: 'HELSINKI RESIDENTS SLEEP MORE THAN ANY OTHER EUROPEAN CAPITAL',
            text: 'A pan-European health study has found that Helsinki residents average 7 hours and 48 minutes of sleep per night, more than any other European capital. Researchers attribute this to "dark winters, excellent blackout curtains, and a cultural acceptance that going to bed at 9:30 PM is not embarrassing." Rome came last with 6 hours 12 minutes. "We have things to do at night," responded an Italian researcher.',
        },
        // --- batch 8 ---
        {
            title: 'KIASMA MUSEUM ATTENDANCE HITS FIVE-YEAR HIGH',
            text: 'The Museum of Contemporary Art Kiasma has reported its highest annual attendance in five years, driven largely by an interactive exhibit that allows visitors to lie on the floor and stare at a slowly rotating ceiling. "It sounds simple, but the effect is profound," said museum director Laura Virtanen. "People stay for hours." The museum gift shop reports a corresponding increase in sales of neck pillows.',
        },
        {
            title: 'NEW CYCLING BRIDGE CONNECTS JÄTKÄSAARI TO RUOHOLAHTI',
            text: 'A new pedestrian and cycling bridge connecting Jätkäsaari to Ruoholahti has opened to enthusiastic crowds, cutting the commute between the two districts from 15 minutes to 4. "I can now see my apartment from the office and vice versa," said one delighted cyclist. "Whether this is good or bad remains to be seen." The bridge features heated railings to prevent ice formation, a detail that has been described as "aggressively Finnish."',
        },
        {
            title: 'OUTBREAK OF POLITENESS ON TRAM LINE 6 BAFFLES COMMUTERS',
            text: 'Passengers on Tram Line 6 have reported an unusual outbreak of politeness this month, with multiple incidents of people offering seats, holding doors, and even making brief eye contact. "A man said \'hyvää huomenta\' to me at 7:45 AM," reported one shaken commuter. "I didn\'t know how to respond." HSL has issued a statement confirming that this is not an organized campaign. Sociologists are investigating.',
        },
        {
            title: 'HELSINKI FOOD TRUCK SCENE EXPLODES WITH 80 NEW VENDORS',
            text: 'Helsinki\'s food truck scene has grown by 80 new vendors this year, with cuisines ranging from traditional Finnish salmon soup to Korean-Finnish fusion tacos. The most talked-about newcomer is "Makkaraperunat Deluxe," which serves upscale versions of the classic makkara-and-fries combination. "We use artisan sausages and hand-cut potatoes," explained the owner. "It\'s still street food. It just went to university."',
        },
        {
            title: 'LAUTTASAARI DOG PARK VOTED BEST IN EUROPE',
            text: 'The off-leash dog park in Lauttasaari has been named Europe\'s best urban dog park by Canine Monthly magazine. Judges praised its "generous space, beach access, and the unusually calm demeanor of Finnish dogs." The park serves approximately 300 dogs daily, most of whom, observers note, maintain a respectful distance from each other. "Finnish dogs are just like Finnish people," said one owner. "Friendly, but not pushy."',
        },
        {
            title: 'LONGEST CONTINUOUS SAUNA RELAY RAISES €45,000 FOR CHARITY',
            text: 'A 72-hour continuous sauna relay in Merihaka has raised €45,000 for the Finnish Mental Health Association. Teams of six maintained at least one person in the sauna at all times for three full days. "Hour 60 was the hardest," admitted team captain Olli Koivisto. "But at hour 65, something transcendental happened. I can\'t explain it." The event also set an unofficial record for most buckets of water thrown on a kiuas.',
        },
        {
            title: 'ATENEUM ACQUIRES LONG-LOST HELENE SCHJERFBECK SELF-PORTRAIT',
            text: 'The Ateneum Art Museum has acquired a previously unknown self-portrait by Helene Schjerfbeck, found in a private collection in Paris. The small oil painting, dated 1915, shows the artist in profile with her characteristic spare style. "It\'s unmistakably Schjerfbeck," said the museum\'s chief curator. "We nearly fell off our chairs." The painting will go on permanent display next month.',
        },
        {
            title: 'RECORD SNOWFALL IN APRIL CATCHES ENTIRE CITY OFF GUARD',
            text: 'Helsinki received 25 centimeters of snow in a single April night, causing widespread confusion among residents who had already packed away their winter boots. "I was wearing sandals," said one man in Kallio, now standing in a snowdrift. The city\'s snowplows, which had been decommissioned for the season, were hastily reactivated. "Every year we are surprised by this," sighed a city official. "Every single year."',
        },
        {
            title: 'MUNKKINIEIMI RESIDENTS WIN RIGHT TO KEEP COMMUNITY GARDEN',
            text: 'After a two-year battle with developers, residents of Munkkiniemi have won the right to keep their beloved community garden, which occupies a prime waterfront plot. The garden grows approximately 2 tons of vegetables annually and serves as a social hub for the neighborhood. "You can\'t put a price on 2 tons of organic tomatoes and 200 friendships," said garden coordinator Maarit Laaksonen. The developer has agreed to build around it.',
        },
        {
            title: 'ROOFTOP BEEKEEPING TREND PRODUCES 3 TONS OF URBAN HONEY',
            text: 'Helsinki\'s growing rooftop beekeeping community has produced over 3 tons of honey this year, harvested from hives atop office buildings, schools, and at least one church. The honey, marketed as "Helsinki Roof Honey," is sold at local markets and varies in flavor by district. "Kallio honey tastes different from Eira honey," explained beekeeper Veli Aalto. "Something about the linden trees. Or the nightlife. Hard to say."',
        },
        // --- batch 9 ---
        {
            title: 'HELSINKI METRO CELEBRATES 40 YEARS OF SERVICE',
            text: 'Helsinki\'s metro system has celebrated its 40th anniversary, having carried over 2 billion passengers since 1982. To mark the occasion, the original orange metro cars were brought out for a commemorative run. "They still smell exactly the same," remarked one nostalgic passenger. The celebration included free rides, a photo exhibition, and a cake shaped like the Ruoholahti station, which took three bakers four days to construct.',
        },
        {
            title: 'FINNISH DESIGN STUDENT\'S LAMP GOES VIRAL, SELLS 50,000 UNITS',
            text: 'A lamp designed by Aalto University student Aino Koskinen as a thesis project has become an unexpected global hit, selling 50,000 units in six months. The lamp, called "Kevät" (Spring), uses a single bent piece of birch plywood and costs €35. "I designed it because I couldn\'t afford the lamps I liked," Koskinen explained. Iittala has reportedly made an acquisition offer. Koskinen is "thinking about it."',
        },
        {
            title: 'CONTROVERSIAL PLAN TO ADD WI-FI TO ALL CITY SAUNAS',
            text: 'A proposal to install Wi-Fi in Helsinki\'s public saunas has sparked the most heated public debate since the 2017 central library name controversy. Proponents argue it would attract younger users. Opponents have called it "a fundamental violation of everything the sauna represents." A compromise — Wi-Fi in the changing rooms only — has been rejected by both sides. The sauna society\'s chairman simply said: "No."',
        },
        {
            title: 'RECORD NUMBER OF BABIES NAMED AFTER HELSINKI DISTRICTS',
            text: 'Helsinki\'s naming statistics reveal a surge in babies named after city districts. "Kallio" leads with 23 newborns, followed by "Eira" (18) and "Lauri" (which parents insist is short for Lauttasaari, though the name office disagrees). "Sörnäinen" has not been used, though one couple reportedly considered it. The trend has been attributed to "millennial nostalgia for neighborhoods they can no longer afford."',
        },
        {
            title: 'HIETANIEMI BEACH DECLARED CLEANEST URBAN BEACH IN EUROPE',
            text: 'Helsinki\'s Hietaniemi Beach has been declared Europe\'s cleanest urban beach by the European Environmental Agency, with water quality rated "excellent" for the 12th consecutive year. "The water is pristine," confirmed the agency. "Extremely clean. Also extremely cold." Beach attendance this summer reached 500,000, though average swim duration remained at a brisk four minutes.',
        },
        {
            title: 'HELSINKI TRAM NETWORK TO ADD NEW LINE THROUGH JÄTKÄSAARI',
            text: 'HSL has announced plans for a new tram line connecting Jätkäsaari to the central railway station via Ruoholahti. The line, designated Tram 15, will carry an estimated 30,000 passengers daily and feature "the quietest trams in Europe." Jätkäsaari residents, who have been requesting better public transport for a decade, responded with measured Finnish enthusiasm: "It\'s about time," said one. "But we\'ll believe it when we see it."',
        },
        {
            title: 'ESCAPED PEACOCK FROM KORKEASAARI ZOO FOUND IN KAMPPI',
            text: 'A peacock that escaped from Korkeasaari Zoo three weeks ago was found living comfortably in the Kamppi shopping center, where it had apparently been surviving on dropped food court leftovers. "He was roosting on top of the escalator," said a security guard. "Honestly, he seemed happier here than at the zoo." The peacock, named "Kalle" by mall staff, was returned to the zoo but is reportedly "sulking."',
        },
        {
            title: 'HELSINKI LIBRARY SYSTEM ADDS POWER TOOLS TO LENDING CATALOG',
            text: 'Following the success of lending sewing machines and sports equipment, Helsinki\'s library system now offers power tools including drills, jigsaws, and sanders. "Why buy a jigsaw you\'ll use twice?" reasoned the head of collections. The most reserved item is a pressure washer, with a six-week waiting list. The libraries report only one incident so far: a returned drill with "a suspicious amount of sawdust and an apology note."',
        },
        {
            title: 'FOG BLANKETS HELSINKI FOR THREE CONSECUTIVE DAYS',
            text: 'A rare three-day fog event blanketed Helsinki in an atmospheric mist that reduced visibility to 50 meters in some areas. While ferry services were disrupted and several tourists got lost in Suomenlinna, most residents found the experience enchanting. "The city looked like a Tove Jansson illustration," said one photographer. Instagram posts of fog-wrapped Helsinki Cathedral exceeded 30,000. The fog lifted on Thursday, and everyone immediately missed it.',
        },
        {
            title: 'KANTELE FLASH MOB SURPRISES CENTRAL RAILWAY STATION',
            text: 'Approximately 60 kantele players staged an unannounced flash mob performance at Helsinki Central Railway Station, filling the grand hall with the ancient Finnish instrument\'s ethereal sound. Commuters stopped to listen in stunned silence. One elderly woman was seen crying. "I haven\'t heard that many kanteles since my grandmother\'s village," she said. The performers, organized via a Facebook group, disappeared as quickly as they arrived.',
        },
        // --- batch 10 ---
        {
            title: 'LAST REMAINING PHONE BOOTH IN HELSINKI GRANTED PROTECTED STATUS',
            text: 'The sole surviving public phone booth in Helsinki, located near the Hakaniemi market hall, has been granted official heritage protection status. "It hasn\'t had a working phone since 2009," admitted the preservation board. "But it\'s a beautiful example of 1970s Finnish industrial design." The booth is now used primarily as a rain shelter and, on one memorable occasion, as a very small art gallery.',
        },
        {
            title: 'CITY INSTALLS HEATED BUS STOPS IN PILOT PROGRAM',
            text: 'Helsinki has begun installing heated bus shelters in a pilot program across 20 locations, using radiant heating panels powered by renewable energy. "Waiting for the 66 bus in January just got 15 degrees warmer," said one grateful commuter in Meilahti. Critics have questioned the energy cost. Supporters counter that "a warm Finn is a productive Finn," which has become the unofficial slogan of the project.',
        },
        {
            title: 'NATIONAL EMOJI COLLECTION ADDS "FINNISH PERSON AT BUS STOP"',
            text: 'Finland\'s national emoji collection, maintained by the Ministry of Foreign Affairs, has added a new emoji depicting a lone person standing at a bus stop with exactly 1.5 meters of space on either side. "It captures something essential about Finnish culture," explained the ministry. The emoji joins earlier additions including "sauna," "Nokia 3310," and "person not making eye contact." International downloads have exceeded expectations.',
        },
        {
            title: 'CROSS-COUNTRY SKI TRAIL THROUGH CENTRAL PARK EXTENDED BY 5KM',
            text: 'Helsinki\'s popular cross-country ski trail through Central Park has been extended by 5 kilometers, now stretching from Töölö to Haltiala farm. The trail is illuminated for evening skiing and groomed daily when snow conditions permit. "Some people commute on it," noted the parks department. "We had one man ski from Paloheinä to his office in Pasila every morning last winter. He was always the first one there."',
        },
        {
            title: 'ANNUAL HERRING MARKET CELEBRATES 277TH CONSECUTIVE YEAR',
            text: 'The Helsinki Baltic Herring Market, held annually since 1743, celebrated its 277th year on the quayside of Market Square. Over 200 fishing vessels participated, selling everything from traditional salted herring to herring ice cream (which reviewers described as "exactly as alarming as it sounds"). The oldest participating family has been selling herring at the market for six generations. "The recipe hasn\'t changed," said the current patriarch. "Neither have the jokes."',
        },
        {
            title: 'CONSTRUCTION OF WORLD\'S LARGEST SNOW SCULPTURE IN KALASATAMA',
            text: 'A team of 30 artists has constructed what they claim is the world\'s largest snow sculpture in a vacant lot in Kalasatama. The sculpture, depicting a giant Moomin emerging from the sea, stands 12 meters tall and took three weeks to complete. "We had to work at night when it was coldest," explained lead artist Katja Rintanen. The sculpture is expected to last until March, "or the first warm weekend, whichever comes first."',
        },
        {
            title: 'HELSINKI STARTUP CREATES APP THAT PREDICTS OPTIMAL SAUNA TIME',
            text: 'A Helsinki startup called SaunaMetrics has launched an app that calculates the "optimal sauna time" based on outside temperature, humidity, personal health data, and "current stress level." The app has been downloaded 200,000 times. Finnish users have overwhelmingly given it one-star reviews, with comments including "I know when to leave the sauna" and "this is the most unnecessary Finnish invention since the Nokia N-Gage."',
        },
        {
            title: 'ABANDONED BUNKER BENEATH KAMPPI CONVERTED TO MUSHROOM FARM',
            text: 'An abandoned Cold War-era bunker beneath Kamppi has been converted into an urban mushroom farm producing 500 kg of oyster mushrooms per month. The constant 12°C temperature and high humidity make it "basically a natural mushroom palace," said founder Mika Rantanen. The mushrooms are sold to Helsinki restaurants. "People are eating mushrooms grown in a nuclear bunker," he said. "The marketing kind of writes itself."',
        },
        {
            title: 'ICEBREAKER URHO OPENS AS FLOATING MUSEUM AND EVENT VENUE',
            text: 'The legendary icebreaker Urho, decommissioned after 40 years of service in the Baltic, has reopened as a floating museum and event venue in South Harbour. Visitors can explore the engine room, bridge, and crew quarters. "The ship broke through ice 3 meters thick," said the museum guide. "Now it hosts birthday parties. But it still has its dignity." The ship\'s horn is sounded every day at noon, startling tourists and delighting locals.',
        },
        {
            title: 'STUDY FINDS HELSINKI DOGS ARE HAPPIEST IN FINLAND',
            text: 'A veterinary study conducted by the University of Helsinki has concluded that Helsinki\'s dogs are the happiest in Finland, based on tail-wagging frequency, play behavior, and "general demeanor during walks." Researchers attributed this to "excellent dog parks, a culture of off-leash freedom, and owners who talk to their dogs more than they talk to other humans." The finding surprised no one.',
        },
    ];

    // Rival-specific filler stories — about the tycoons' personal lives and antics
    const RIVAL_FILLER_STORIES = {
        nalle: [
            {
                title: 'WAHLROOS SPOTTED BUYING ENTIRE WINE CELLAR AT AUCTION',
                text: 'Björn "Nalle" Wahlroos raised eyebrows at a Sotheby\'s wine auction this week by purchasing an entire estate cellar of 2,400 bottles, including several cases of 1961 Pétrus. "I simply saw value," Wahlroos explained, adjusting his cufflinks. When asked if he planned to drink it all, he responded: "I plan to appreciate it. There is a difference." The total price was not disclosed but is believed to exceed the GDP of a small island nation.',
                rival: 'nalle',
            },
            {
                title: 'WAHLROOS DISMISSES MARKET FEARS: "SENTIMENT IS FOR AMATEURS"',
                text: 'In a characteristically blunt interview with Kauppalehti, Björn Wahlroos dismissed growing concerns about property market volatility. "Markets fluctuate. That\'s what they do. The question is whether you have the discipline to buy when others panic." When pressed about his own portfolio\'s recent losses, Wahlroos paused for exactly one second. "What losses?" he replied, and ended the interview.',
                rival: 'nalle',
            },
            {
                title: 'WAHLROOS DONATES RARE PAINTING TO ATENEUM — WITH CONDITIONS',
                text: 'The Ateneum Art Museum has received a rare Akseli Gallen-Kallela painting from Björn Wahlroos, valued at an estimated €1.8 million. The donation comes with a single condition: the painting must be hung "at eye level, properly lit, and not next to anything abstract." Museum curators have reportedly complied. "He was very specific about the lighting," said one staff member.',
                rival: 'nalle',
            },
            {
                title: 'WAHLROOS PUBLISHES MEMOIR: "EVERYTHING HAS A PRICE"',
                text: 'Finance magnate Björn Wahlroos has published his long-awaited memoir, provocatively titled "Everything Has a Price — Including This Book." The 640-page volume covers his rise from economics student to one of Finland\'s wealthiest individuals. Critics describe it as "ruthlessly honest" and "exactly what you\'d expect from a man who alphabetizes his sock drawer." It is already a bestseller.',
                rival: 'nalle',
            },
            {
                title: 'WAHLROOS\'S YACHT SPOTTED IN SOUTH HARBOUR',
                text: 'Residents of Kaivopuisto were treated to an unusual sight this week as a 45-meter superyacht bearing the name "Rational Expectations" docked in South Harbour. The vessel is registered to a Luxembourg holding company widely believed to be controlled by Björn Wahlroos. A crew member, when asked about the owner, simply replied: "Mr. Wahlroos values his privacy. And his yacht."',
                rival: 'nalle',
            },
            {
                title: 'WAHLROOS SPOTTED AT OPERA IN PRIVATE BOX — ALONE',
                text: 'Björn Wahlroos attended the Finnish National Opera\'s production of Wagner\'s Parsifal this week, occupying a private box designed for eight. He sat alone for the entire five-hour performance, emerging afterwards to declare it "adequate." When a reporter noted the empty seats beside him, Wahlroos replied: "I find Wagner is best appreciated without the distraction of other people\'s opinions." The opera house has reportedly named the box after him.',
                rival: 'nalle',
            },
            {
                title: 'WAHLROOS COMMISSIONS PORTRAIT FROM FINLAND\'S TOP ARTIST',
                text: 'Art world insiders report that Björn Wahlroos has commissioned a formal oil portrait from one of Finland\'s most celebrated painters. Sources say the sitting lasted exactly 45 minutes — the maximum Wahlroos was willing to allocate. "He sat perfectly still the entire time," the artist reportedly told friends. "It was like painting a statue that occasionally checked its watch."',
                rival: 'nalle',
            },
            {
                title: 'WAHLROOS LAUNCHES PREMIUM FINNISH WHISKY BRAND',
                text: 'In a surprising diversification, Björn Wahlroos has invested in a boutique Finnish whisky distillery in Isokyrö. The spirit, aged in Finnish oak and priced at €450 per bottle, is called "Bear Market." "Single malt is the only honest product left," Wahlroos declared at the launch. "It tells you exactly what it is. Unlike most people." The first batch of 500 bottles sold out within hours.',
                rival: 'nalle',
            },
            {
                title: 'WAHLROOS WINS CHESS TOURNAMENT AGAINST BANKING EXECUTIVES',
                text: 'Björn Wahlroos won a charity chess tournament organized among Nordic banking executives, defeating all seven opponents in an average of 23 moves. "Chess is simple," he told the press. "You see the board clearly, you think several moves ahead, and you never let emotion interfere with strategy." The runner-up, a Swedish banker, described playing Wahlroos as "unsettling."',
                rival: 'nalle',
            },
            {
                title: 'WAHLROOS REFUSES INTERVIEW, GIVES LECTURE INSTEAD',
                text: 'A journalist from Helsingin Sanomat who requested a 30-minute interview with Björn Wahlroos was instead given a 90-minute lecture on Austrian economics, the failings of modern monetary theory, and "why journalists ask the wrong questions." The journalist described the experience as "intellectually bruising but oddly educational." Wahlroos later sent a reading list.',
                rival: 'nalle',
            },
            {
                title: 'WAHLROOS ADDS THIRD FLOOR TO PRIVATE LIBRARY',
                text: 'Building permits reveal that Björn Wahlroos has added a third floor to his private library, bringing the estimated total to over 15,000 volumes. The collection spans economics, philosophy, military history, and "a suspiciously large section on Roman emperors," according to a visiting academic. When asked if he has read them all, Wahlroos replied: "I\'ve read the important ones twice."',
                rival: 'nalle',
            },
            {
                title: 'WAHLROOS ORDERS CUSTOM SUIT FROM SAVILE ROW — IN BULK',
                text: 'London tailoring circles are buzzing with news that Björn Wahlroos placed an order for twelve identical bespoke suits from a Savile Row tailor during a recent visit. "Same fabric, same cut, same everything," confirmed a source. "He said he found a satisfactory configuration and saw no reason to deviate." The total cost is estimated at over €60,000. Wahlroos reportedly paid in cash.',
                rival: 'nalle',
            },
            {
                title: 'WAHLROOS CRITIQUES HELSINKI RESTAURANT: "OVERPRICED MEDIOCRITY"',
                text: 'A brief but devastating review by Björn Wahlroos on a restaurant booking app has sent shockwaves through Helsinki\'s dining scene. The two-star review of a premium Kluuvi establishment reads simply: "Overpriced mediocrity. The bread was good." The restaurant\'s bookings dropped 30% within a week. The bread supplier, meanwhile, has used the quote in their marketing.',
                rival: 'nalle',
            },
            {
                title: 'WAHLROOS WINTER RETREAT: "I GO WHERE THE SILENCE IS"',
                text: 'A rare lifestyle profile reveals that Björn Wahlroos spends two weeks each January at a lakeside cabin in eastern Finland with no internet, no phone, and no visitors. "It is the only time I am truly productive," he explained. "Helsinki has too many people who want to talk to me about things that don\'t matter." He reportedly returns each year with a fully drafted annual investment strategy.',
                rival: 'nalle',
            },
            {
                title: 'WAHLROOS ENDOWS ECONOMICS PRIZE: "ONLY CORRECT THINKING NEED APPLY"',
                text: 'Björn Wahlroos has established an annual €100,000 prize for "exceptional clarity in economic thinking," to be administered by the University of Helsinki. The selection criteria, written by Wahlroos himself, specify that submissions must be "free of jargon, ideology, and wishful thinking." Economists have described the requirements as "intimidating but fair." No one has yet won the prize.',
                rival: 'nalle',
            },
        ],
        hjallis: [
            {
                title: 'HARKIMO THROWS LEGENDARY PARTY AT LINNANMÄKI',
                text: 'Harry "Hjallis" Harkimo rented out the entirety of Linnanmäki amusement park for what guests are calling "the party of the decade." The event featured three live bands, a fireworks display visible from Espoo, and a roller coaster that Harkimo reportedly rode eleven times. "Life is short. Ride the coaster," he told reporters, slightly green-faced but beaming.',
                rival: 'hjallis',
            },
            {
                title: 'HARKIMO ANNOUNCES NEW REALITY TV SHOW: "HJALLIS BUYS HELSINKI"',
                text: 'Entertainment mogul Harry Harkimo has signed a deal with MTV3 for a new reality series following his property acquisitions in Helsinki. "Every deal tells a story," Harkimo explained. "Some stories are comedies. Some are tragedies. Most involve me shouting at a contractor." The network expects strong ratings, noting that Harkimo\'s "unfiltered enthusiasm" tests well with audiences aged 18-65.',
                rival: 'hjallis',
            },
            {
                title: 'HJALLIS ORGANIZES CHARITY ICE HOCKEY MATCH ON SENATE SQUARE',
                text: 'In what the city described as "logistically ambitious," Harry Harkimo organized a charity ice hockey match on a temporary rink in Senate Square. Teams included former NHL players, local politicians, and Harkimo himself, who played all three periods. "I scored twice," he announced proudly. Team records indicate he also received three penalties. "Passionate playing," he clarified.',
                rival: 'hjallis',
            },
            {
                title: 'HARKIMO OPENS POP-UP RESTAURANT IN OWN LIVING ROOM',
                text: 'Harry "Hjallis" Harkimo surprised the Helsinki food scene by converting his living room into a pop-up restaurant for one weekend. The menu, titled "Hjallis\'s Favorites," featured grilled sausages, Finnish new potatoes, and "whatever was in the fridge." All 40 seats sold out in 12 minutes. Reviews ranged from "surprisingly good sausages" to "I think he forgot to charge for the beer."',
                rival: 'hjallis',
            },
            {
                title: 'HJALLIS ATTEMPTS TO BREAK WORLD RECORD FOR LONGEST SAUNA SESSION',
                text: 'Never one to shy from a challenge, Harry Harkimo attempted to break the unofficial world record for continuous sauna time at his private sauna in Munkkiniemi. He lasted four hours and seventeen minutes before emerging "slightly dehydrated but philosophically enriched." The attempt was streamed live on YouTube, drawing 80,000 viewers. "I found inner peace at around hour three," he reported.',
                rival: 'hjallis',
            },
            {
                title: 'HJALLIS BUYS VINTAGE ICEBREAKER, PLANS FLOATING NIGHTCLUB',
                text: 'Harry Harkimo has purchased a decommissioned 1960s icebreaker from the Finnish Navy, announcing plans to convert it into a floating nightclub and event venue to be moored in South Harbour. "Helsinki needs more venues on the water," he declared. "And this ship has character." Engineers have cautiously noted that the vessel "needs some work." Harkimo responded: "So does Helsinki\'s nightlife."',
                rival: 'hjallis',
            },
            {
                title: 'HARKIMO COACHES YOUTH HOCKEY TEAM, TEAM WINS TOURNAMENT',
                text: 'In between property acquisitions, Harry Harkimo found time to coach a local youth ice hockey team in Kallio. The team, previously ranked last in their division, won their regional tournament after six weeks under Harkimo\'s guidance. "I just told them what I tell everyone: play hard, have fun, and never apologize for winning," he said. The team has requested he stay on permanently. Harkimo is "thinking about it."',
                rival: 'hjallis',
            },
            {
                title: 'HJALLIS SPOTTED TESTING GO-KARTS IN EMPTY PARKING GARAGE',
                text: 'Security camera footage from a Kamppi parking garage shows Harry Harkimo racing go-karts through three levels at 2 AM. He was accompanied by what witnesses describe as "at least six friends and a lot of laughter." When confronted with the footage, Harkimo grinned. "I\'m considering buying the garage. I was doing due diligence. At speed." The garage owner has not pressed charges.',
                rival: 'hjallis',
            },
            {
                title: 'HARKIMO LAUNCHES PODCAST: "HJALLIS UNPLUGGED"',
                text: 'Harry Harkimo\'s new weekly podcast, "Hjallis Unplugged," has debuted at number one on the Finnish podcast charts. The format features Harkimo interviewing Helsinki personalities while sitting in a sauna. "The heat makes people honest," he explained. "Nobody lies in a sauna." The first episode, featuring a city council member, ran two hours over its planned length. "We lost track of time. And water."',
                rival: 'hjallis',
            },
            {
                title: 'HJALLIS PROPOSES ANNUAL HELSINKI FUN RUN — IN VIKING COSTUMES',
                text: 'Never content with conventional charity events, Harry Harkimo has proposed a 10-kilometer fun run through central Helsinki in which all participants must wear Viking costumes. "Fitness, history, and fun," he summarized. "What\'s not to love?" The city events board has approved the proposal with the condition that "no actual weapons be carried." Harkimo says registration is already at 3,000.',
                rival: 'hjallis',
            },
            {
                title: 'HARKIMO\'S DOG BECOMES CELEBRITY AFTER TV APPEARANCE',
                text: 'Harry Harkimo\'s Finnish Lapphund, named "Peku," has become an unlikely celebrity after appearing on Harkimo\'s reality show. The dog, who accompanies Harkimo to property viewings, has been photographed sitting in boardrooms, riding in sports cars, and once on the ice at a hockey game. Peku now has 45,000 Instagram followers. "He\'s more popular than I am," Harkimo admitted. "And better looking."',
                rival: 'hjallis',
            },
            {
                title: 'HJALLIS RENTS ENTIRE CINEMA FOR SURPRISE MOVIE NIGHT',
                text: 'Harry Harkimo rented all 12 screens at Finnkino Tennispalatsi for an impromptu "Hjallis Movie Night," inviting 2,000 Helsinkians via a social media post at 4 PM. By 7 PM, every seat was taken. The film selection — chosen by Harkimo — consisted entirely of Rocky films. "Rocky teaches you everything you need to know about life and business," he said. Free popcorn was provided. Three tons of it.',
                rival: 'hjallis',
            },
            {
                title: 'HARKIMO INVESTS IN FOOD TRUCK FLEET SERVING FREE SOUP',
                text: 'In a move that blurs the line between business and philanthropy, Harry Harkimo has launched a fleet of five food trucks serving free salmon soup across Helsinki during winter months. "Nobody should be cold and hungry in my city," he declared. The trucks, painted in Jokerit hockey colors, serve an estimated 500 portions daily. When asked about the cost, Harkimo shrugged: "Less than a bad property deal. And much more satisfying."',
                rival: 'hjallis',
            },
            {
                title: 'HJALLIS CHALLENGES MAYOR TO ARM-WRESTLING MATCH FOR CHARITY',
                text: 'Harry Harkimo has publicly challenged Helsinki\'s mayor to an arm-wrestling match, with €50,000 going to the winner\'s chosen charity. "It\'s direct, it\'s honest, and it takes 30 seconds," Harkimo argued. The mayor\'s office released a diplomatic statement describing the challenge as "under consideration." Betting odds, which appeared online within hours, favor Harkimo 3-to-1.',
                rival: 'hjallis',
            },
            {
                title: 'HARKIMO WRITES CHILDREN\'S BOOK: "HJALLIS AND THE MAGIC HOCKEY PUCK"',
                text: 'Harry Harkimo has published a children\'s book in which a magical hockey puck teaches a young Finnish girl about entrepreneurship, teamwork, and "why you should always shoot when you have the chance." The book, illustrated by a Kallio artist, has sold 20,000 copies and is now being read in schools across Finland. "My ghost writer was very expensive," Harkimo joked. "Just kidding. I wrote every word. In one weekend."',
                rival: 'hjallis',
            },
        ],
        risto: [
            {
                title: 'SIILASMAA KEYNOTES AI CONFERENCE, PREDICTS PROPERTY REVOLUTION',
                text: 'Tech visionary Risto Siilasmaa delivered a keynote address at the Helsinki AI Summit, declaring that artificial intelligence will "fundamentally transform how real estate is valued, managed, and traded within five years." The audience of 2,000 developers gave a standing ovation. When asked backstage if his own investments use AI, Siilasmaa smiled. "What do you think I\'ve been doing?"',
                rival: 'risto',
            },
            {
                title: 'SIILASMAA\'S STARTUP ACCELERATOR GRADUATES 15 COMPANIES',
                text: 'The Siilasmaa Ventures accelerator program has graduated its latest cohort of 15 startups, seven of which are focused on proptech — property technology. "The next unicorn in real estate will come from Helsinki," Siilasmaa predicted. "We have the engineering talent, the data, and frankly, some of the most interesting buildings in Europe to test on." Combined valuation of the cohort exceeds €200 million.',
                rival: 'risto',
            },
            {
                title: 'SIILASMAA DONATES €5 MILLION TO AALTO UNIVERSITY TECH PROGRAM',
                text: 'Former Nokia chairman Risto Siilasmaa has donated €5 million to Aalto University\'s computer science department, earmarked for AI and machine learning research. "Finland\'s future is in technology. It always has been," he stated during the announcement ceremony. Students have already nicknamed the new lab wing "The Risto Room," though Siilasmaa insists it be called "Lab 404 — because you\'ll find things you weren\'t looking for."',
                rival: 'risto',
            },
            {
                title: 'SIILASMAA SEEN JOGGING WITH DRONE OVERHEAD',
                text: 'Residents of Munkkiniemi have reported seeing Risto Siilasmaa jogging along the waterfront accompanied by a small drone. Witnesses say the drone appeared to be filming his route and occasionally hovering over properties. "I believe it\'s his way of scouting real estate while exercising," suggested one neighbor. Siilasmaa\'s office described it as "a personal wellness project" and declined further comment.',
                rival: 'risto',
            },
            {
                title: 'SIILASMAA PUBLISHES ANALYSIS: "HELSINKI\'S MOST UNDERVALUED DISTRICTS"',
                text: 'Risto Siilasmaa has published a data-driven report ranking Helsinki\'s districts by "unrealized potential," using metrics including transit connectivity, demographic trends, and proximity to tech hubs. The report, available free on his website, has been downloaded 50,000 times and caused a measurable spike in property inquiries in three districts. "Information wants to be free," Siilasmaa noted. "Property prices, less so."',
                rival: 'risto',
            },
            {
                title: 'SIILASMAA INSTALLS SOLAR PANELS ON ALL OWNED PROPERTIES',
                text: 'Risto Siilasmaa has announced a program to install solar panels on every property in his Helsinki portfolio, making him the first major investor to go fully renewable. "It\'s not idealism, it\'s mathematics," he explained. "Energy costs are a variable I can eliminate." The project is expected to reduce operating costs by 15% within three years. Environmental groups have praised the move. Wahlroos has reportedly called it "a rounding error."',
                rival: 'risto',
            },
            {
                title: 'SIILASMAA\'S AI PREDICTS MARKET DOWNTURN — THREE MONTHS EARLY',
                text: 'Risto Siilasmaa revealed at a tech conference that his proprietary AI system predicted the recent property market correction three months before it happened. "The model saw patterns in building permits, migration data, and consumer sentiment that humans missed," he said. When asked if he acted on the prediction, Siilasmaa smiled. "I wouldn\'t be telling you about it if I hadn\'t."',
                rival: 'risto',
            },
            {
                title: 'SIILASMAA HOSTS CODING WORKSHOP FOR HELSINKI SCHOOLCHILDREN',
                text: 'Risto Siilasmaa spent a Saturday teaching Python programming to 200 Helsinki schoolchildren at the Oodi Library. "Every child should learn to code before they learn to invest," he told parents. "Though ideally they\'ll do both." The workshop, now in its fourth year, has produced several national programming competition winners. Siilasmaa personally reviews the top students\' code. "I leave comments," he said. "Constructive ones."',
                rival: 'risto',
            },
            {
                title: 'SIILASMAA BUILDS PERSONAL DATA CENTER IN PROPERTY BASEMENT',
                text: 'Building inspectors have confirmed that Risto Siilasmaa has installed a private server room in the basement of one of his Ruoholahti office properties. The facility reportedly houses "significant computing resources" dedicated to real estate analytics. "Other investors use spreadsheets," noted one tech journalist. "Siilasmaa uses a supercomputer. It\'s not really a fair fight." Siilasmaa\'s office declined to confirm the computing specifications.',
                rival: 'risto',
            },
            {
                title: 'SIILASMAA PENS OP-ED: "FINLAND NEEDS MORE RISK-TAKERS"',
                text: 'In a widely-shared op-ed in Helsingin Sanomat, Risto Siilasmaa argued that Finland\'s culture of caution is holding back economic growth. "We celebrate modesty and punish failure," he wrote. "Silicon Valley celebrates failure and punishes modesty. The truth is somewhere in between, but we need to move our dial." The piece generated 3,000 comments, roughly split between "he\'s absolutely right" and "easy for a billionaire to say."',
                rival: 'risto',
            },
            {
                title: 'SIILASMAA\'S SMART BUILDINGS WIN EUROPEAN INNOVATION AWARD',
                text: 'Three of Risto Siilasmaa\'s Helsinki properties have won a European Innovation in Real Estate award for their smart building systems. The properties use AI to optimize heating, lighting, and maintenance schedules, reducing energy consumption by 40%. "A building should be as smart as the people inside it," Siilasmaa said at the ceremony. "Ideally smarter." He accepted the award via holographic video call.',
                rival: 'risto',
            },
            {
                title: 'SIILASMAA TESTS AUTONOMOUS DELIVERY ROBOTS IN SÖRNÄINEN',
                text: 'Small autonomous robots have been spotted making deliveries in Sörnäinen, and sources confirm they are part of a pilot program funded by Risto Siilasmaa. The robots deliver packages, groceries, and takeout food within a 2-kilometer radius of Siilasmaa\'s office properties. "It\'s not about delivery," Siilasmaa explained. "It\'s about proving that autonomous systems can operate safely in a Finnish winter." So far, the robots have had one incident: a standoff with a curious cat.',
                rival: 'risto',
            },
            {
                title: 'SIILASMAA READS 127 BOOKS THIS YEAR — PUBLISHES THE LIST',
                text: 'Risto Siilasmaa has published his annual reading list, comprising 127 books read over the past year. The selection spans artificial intelligence, urban planning, behavioral economics, and one Finnish crime novel ("for balance," he noted). The list, posted on his blog, was downloaded 80,000 times. The most recommended title: "Thinking in Systems" by Donella Meadows. "Every property investor should read it," he said. "Every person should read it."',
                rival: 'risto',
            },
            {
                title: 'SIILASMAA FUNDS FIBER OPTIC UPGRADE FOR OWNED BUILDINGS',
                text: 'Risto Siilasmaa has funded a complete fiber optic upgrade for all properties in his portfolio, offering tenants 10-gigabit internet at no additional cost. "Connectivity is not a luxury, it\'s infrastructure," he said. "I wouldn\'t buy a building without plumbing. Why would I rent one without proper internet?" Tenant satisfaction surveys in Siilasmaa\'s properties have risen to 97%. Rival landlords are reportedly "annoyed."',
                rival: 'risto',
            },
            {
                title: 'SIILASMAA PROPOSES "TECH QUARTER" FOR EASTERN HELSINKI',
                text: 'In a presentation to the city planning board, Risto Siilasmaa outlined a vision for a "Helsinki Tech Quarter" spanning Kalasatama and Sörnäinen. The proposal includes co-working spaces, startup housing, and a 24/7 innovation hub. "Helsinki has the talent. What it needs is density," he argued. "Put the right people in the right buildings and things happen." The planning board described the proposal as "ambitious but credible." Siilasmaa is funding the feasibility study himself.',
                rival: 'risto',
            },
        ],
    };

    // Rival personality descriptions for day 1 newspaper
    const RIVAL_INTROS = {
        nalle: {
            name: 'Björn "Nalle" Wahlroos',
            text: 'The silver-haired finance titan needs no introduction. Wahlroos, whose fortune spans banking, insurance, and premium real estate, has announced his intention to "acquire every property worth acquiring" in Helsinki. Known for his ruthless efficiency and preference for the finest addresses, competitors would be wise not to underestimate his deep pockets. "I don\'t compete," Wahlroos stated flatly. "I win."',
        },
        hjallis: {
            name: 'Harry "Hjallis" Harkimo',
            text: 'The entertainment mogul and eternal optimist has thrown his considerable hat into the ring. Harkimo, famous for his sports ventures and television appearances, sees Helsinki\'s property market as "the ultimate game." With a keen eye for entertainment venues, restaurants, and properties with character, Hjallis plans to turn Helsinki into his personal playground. "Business should be fun," he grinned. "If it\'s not fun, you\'re doing it wrong."',
        },
        risto: {
            name: 'Risto Siilasmaa',
            text: 'The tech visionary and former Nokia chairman brings a data-driven approach to the property race. Siilasmaa has been quietly analyzing Helsinki\'s districts using proprietary algorithms, targeting office spaces and tech corridors with surgical precision. "Real estate is just another system to optimize," he explained, adjusting his glasses. "I\'ve studied the numbers. I like what I see."',
        },
    };

    // Map special event texts to illustration IDs for newspaper sprites
    const EVENT_ILLUSTRATIONS = {
        'ALIEN INVASION!': 'alien',
        'TONTTU INVASION!': 'tonttu',
        'MOOSE RUSH HOUR!': 'moose',
        'NOKIA COMEBACK!': 'nokia',
        'NORTHERN LIGHTS OVER HELSINKI!': 'northern_lights',
        'GIANT RUBBER DUCK!': 'rubber_duck',
        'ANGRY BIRD!': 'angry_bird',
        'POLAR BEARS IN HELSINKI!': 'polar_bear',
        'SWEDISH INVASION!': 'swedish',
    };

    // Pick a filler index that hasn't been used yet in this campaign
    function pickFillerIndex(gameState) {
        if (!gameState.usedFillerIndices) gameState.usedFillerIndices = [];
        const available = [];
        for (let i = 0; i < FILLER_STORIES.length; i++) {
            if (!gameState.usedFillerIndices.includes(i)) available.push(i);
        }
        if (available.length === 0) {
            gameState.usedFillerIndices = [];
            for (let i = 0; i < FILLER_STORIES.length; i++) available.push(i);
        }
        const idx = available[Math.floor(Math.random() * available.length)];
        gameState.usedFillerIndices.push(idx);
        return idx;
    }

    function pickFiller(gameState) {
        return FILLER_STORIES[pickFillerIndex(gameState)];
    }

    // Pick a rival filler story (also tracked to avoid repeats)
    function pickRivalFiller(gameState, rivalId) {
        if (!gameState.usedRivalFillerIndices) gameState.usedRivalFillerIndices = {};
        if (!gameState.usedRivalFillerIndices[rivalId]) gameState.usedRivalFillerIndices[rivalId] = [];
        const pool = RIVAL_FILLER_STORIES[rivalId] || [];
        if (pool.length === 0) return null;
        const used = gameState.usedRivalFillerIndices[rivalId];
        const available = [];
        for (let i = 0; i < pool.length; i++) {
            if (!used.includes(i)) available.push(i);
        }
        if (available.length === 0) {
            gameState.usedRivalFillerIndices[rivalId] = [];
            for (let i = 0; i < pool.length; i++) available.push(i);
        }
        const idx = available[Math.floor(Math.random() * available.length)];
        gameState.usedRivalFillerIndices[rivalId].push(idx);
        return pool[idx];
    }

    function generateDay1Paper(gameState) {
        const year = gameState.year;
        const playerName = gameState.playerName;
        const rivals = gameState.rivals;

        const stories = [];

        if (rivals.length === 0) {
            stories.push({
                headline: true,
                title: 'LONE INVESTOR SETS SIGHTS ON HELSINKI CROWN',
                text: `In a bold and unusual move, a single investor has declared their intention to conquer Helsinki\'s property market alone. With no rival bidders in sight, ${playerName} faces only the city itself — its fickle economy, harsh winters, and the ever-shifting demands of tenants. "It\'s just me against Helsinki," ${playerName} reportedly said. Analysts note that the city has humbled many before.`,
                rival: 'player',
            });
            stories.push({
                title: `${playerName.toUpperCase()} STEPS INTO THE SPOTLIGHT`,
                text: `${playerName} has arrived in Helsinki with ambition and a plan. Without the distraction of rival tycoons, the focus will be on pure empire-building — buying, upgrading, and managing properties across the city\'s diverse districts. "No competitors means no excuses," observed one market analyst. "Every success and every failure belongs to them alone."`,
                rival: 'player',
            });
        } else {
            stories.push({
                headline: true,
                title: 'THE RACE FOR HELSINGIN HERRA BEGINS',
                text: `Helsinki\'s property market is bracing for an unprecedented shakeup as ${rivals.length + 1} ambitious investors have declared their intention to dominate the city\'s real estate landscape. The competition to become the undisputed Lord of Helsinki — Helsingin Herra — is officially underway. Industry analysts predict fierce bidding wars, strategic acquisitions, and no shortage of drama in the months ahead.`,
            });

            stories.push({
                title: `NEW CONTENDER: ${playerName.toUpperCase()} ENTERS THE ARENA`,
                text: `A bold new player has emerged on Helsinki\'s property scene. ${playerName}, armed with ambition and a keen eye for opportunity, has declared their intention to build a real estate empire from the ground up. While some established players have dismissed the newcomer, veteran market watchers urge caution. "Never underestimate someone with nothing to lose and everything to prove," noted one analyst.`,
                rival: 'player',
            });

            for (const rival of rivals) {
                const intro = RIVAL_INTROS[rival.id];
                if (intro) {
                    stories.push({
                        title: `${intro.name.toUpperCase()} JOINS THE FRAY`,
                        text: intro.text,
                        rival: rival.id,
                    });
                }
            }
        }

        // Fill remaining slots with filler stories so the paper isn't thin
        const targetStories = 5;
        while (stories.length < targetStories) {
            stories.push(pickFiller(gameState));
        }

        return {
            date: `January ${year}`,
            stories,
        };
    }

    function generateYearlyPaper(gameState, yearlyLog, reviewYear) {
        const playerName = gameState.playerName;
        const stories = [];
        const events = yearlyLog.filter(e => e.year === reviewYear);

        const specialEvents = events.filter(e => e.type === 'special_event');
        const regularEvents = events.filter(e => e.type === 'event');
        const playerBuys = events.filter(e => e.type === 'player_buy');
        const playerSells = events.filter(e => e.type === 'player_sell');
        const rivalBuys = events.filter(e => e.type === 'rival_buy');
        const auctions = events.filter(e => e.type === 'auction');

        // HEADLINE
        if (specialEvents.length > 0) {
            const evt = specialEvents[0];
            stories.push({
                headline: true,
                title: `${evt.text.toUpperCase()}: THE EVENT THAT DEFINED ${reviewYear}`,
                text: generateSpecialEventArticle(evt, reviewYear),
                illustration: EVENT_ILLUSTRATIONS[evt.text] || null,
            });
        } else if (auctions.length > 0) {
            const a = auctions[0];
            stories.push({
                headline: true,
                title: 'BIDDING WAR SHAKES HELSINKI PROPERTY MARKET',
                text: `${a.text}. The dramatic auction was the talk of Helsinki\'s business circles for weeks. Market analysts noted that the aggressive bidding signals growing confidence — or perhaps desperation — among the city\'s top investors. ${auctions.length > 1 ? `A total of ${auctions.length} bidding wars took place throughout ${reviewYear}.` : ''}`,
                rival: a.winnerId || null,
            });
        } else if (playerBuys.length > 0) {
            const totalBuys = playerBuys.length;
            stories.push({
                headline: true,
                title: `${playerName.toUpperCase()} EXPANDS EMPIRE WITH ${totalBuys} ACQUISITION${totalBuys > 1 ? 'S' : ''}`,
                text: `${playerName} made waves in Helsinki\'s property market this year, acquiring ${totalBuys} propert${totalBuys > 1 ? 'ies' : 'y'}. ${playerBuys[0].text}. ${totalBuys > 1 ? `The spending spree continued throughout the year, with the latest acquisition in ${MONTH_NAMES[playerBuys[playerBuys.length - 1].month]}.` : ''} Rivals are reportedly watching closely.`,
                rival: 'player',
            });
        } else {
            stories.push({
                headline: true,
                title: `${reviewYear}: A YEAR OF QUIET STRATEGY IN HELSINKI`,
                text: 'In a year marked more by patience than action, Helsinki\'s property market saw relatively modest activity. Analysts suggest the major players are conserving resources for a bigger push. "The calm before the storm," predicted one industry insider. "Next year will be different."',
            });
        }

        // SMALLER STORIES
        const smallStories = [];

        // Rival activity summary
        if (rivalBuys.length > 0) {
            const rivalCounts = {};
            for (const rb of rivalBuys) {
                const name = rb.text.split(' bought ')[0];
                rivalCounts[name] = (rivalCounts[name] || 0) + 1;
            }
            const rivalSummary = Object.entries(rivalCounts)
                .map(([name, count]) => `${name} (${count})`)
                .join(', ');
            smallStories.push({
                title: 'RIVAL INVESTORS STAY ACTIVE',
                text: `Helsinki\'s competitors were busy this year. Property acquisitions by rival: ${rivalSummary}. ${rivalBuys.length > 5 ? 'The fierce competition shows no signs of slowing down.' : 'Each investor appears to be pursuing a distinct strategy.'} Local brokers report that some of the best properties are being snapped up within hours of listing.`,
            });
        }

        // Player sells
        if (playerSells.length > 0) {
            smallStories.push({
                title: `${playerName.toUpperCase()} CASHES OUT ON ${playerSells.length > 1 ? 'PROPERTIES' : 'PROPERTY'}`,
                text: `${playerName} made strategic divestments this year, selling ${playerSells.length} propert${playerSells.length > 1 ? 'ies' : 'y'}. ${playerSells[0].text}. ${playerSells.length > 1 ? '"Sometimes selling at the right time is more important than buying," a financial advisor commented.' : '"A shrewd move," market analysts noted.'}`,
                rival: 'player',
            });
        }

        // Regular events
        if (regularEvents.length > 0) {
            const evtSample = regularEvents.slice(0, 3);
            const evtList = evtSample.map(e => `${e.text} (${MONTH_NAMES[e.month]})`).join('; ');
            const titleVariants = [
                `${reviewYear} IN REVIEW: EVENTS THAT SHAPED THE MARKET`,
                `THE YEAR IN EVENTS: WHAT MOVED HELSINKI IN ${reviewYear}`,
                `${reviewYear} HIGHLIGHTS: A YEAR HELSINKI WON'T FORGET`,
                `FROM JANUARY TO DECEMBER: ${reviewYear}'S BIGGEST MOMENTS`,
                `MARKET MOVERS: THE EVENTS OF ${reviewYear}`,
                `WHAT A YEAR: ${reviewYear} IN HELSINKI REAL ESTATE`,
                `THE ${reviewYear} REPORT: CHAOS, OPPORTUNITY, AND HELSINKI`,
                `${reviewYear} WRAP-UP: THE STORIES BEHIND THE NUMBERS`,
                `LOOKING BACK: HOW ${reviewYear} RESHAPED HELSINKI`,
                `${reviewYear}: A YEAR THAT TESTED EVERY INVESTOR`,
            ];
            const introVariants = [
                `Helsinki saw its share of events this year that affected property values and revenues across the city. Notable moments included: ${evtList}.`,
                `It was a year of surprises in Helsinki's property market. Among the highlights: ${evtList}.`,
                `The Helsinki real estate scene was anything but quiet this year. Key developments included: ${evtList}.`,
                `From market shocks to pleasant surprises, ${reviewYear} delivered plenty of drama. Standout moments: ${evtList}.`,
                `Property investors had their hands full this year navigating a series of impactful events. The highlights: ${evtList}.`,
                `If Helsinki's property market were a novel, ${reviewYear} would be the chapter you couldn't put down. Key plot points: ${evtList}.`,
                `Another year, another rollercoaster for Helsinki real estate. The ride included: ${evtList}.`,
                `The city that never stops surprising did it again. Among the year's defining moments: ${evtList}.`,
                `Whether you profited or panicked, ${reviewYear} gave Helsinki's investors plenty to talk about. The headlines: ${evtList}.`,
                `Looking back, the events of ${reviewYear} will be studied by market analysts for years to come. Chief among them: ${evtList}.`,
            ];
            const closingVariants = [
                'As always, the Helsinki property market proved that adaptability is key.',
                'Veteran investors note that flexibility remains the most valuable asset in Helsinki.',
                'One thing is certain: Helsinki never fails to keep its property investors guessing.',
                '"Every year is different," observed one long-time market analyst. "That\'s what makes Helsinki interesting."',
                'Analysts expect next year to bring its own set of surprises — but then, they always do.',
                'The only constant in Helsinki real estate, it seems, is change itself.',
                '"Buckle up for next year," advised one seasoned broker. "If this year was any indication, we\'re in for a ride."',
                'Whether this was a year of opportunity or caution depends entirely on who you ask.',
                'Helsinki\'s investors are already sharpening their strategies for the year ahead.',
                'As one veteran put it: "Helsinki always has the last laugh."',
            ];
            const moreVariants = [
                `And ${regularEvents.length - 3} more events that kept investors on their toes.`,
                `Plus ${regularEvents.length - 3} additional developments that shook up the market.`,
                `That's not counting ${regularEvents.length - 3} other events that made headlines.`,
                `There were also ${regularEvents.length - 3} more happenings worth noting.`,
                `All told, ${regularEvents.length - 3} further events added to the year's unpredictability.`,
                `The remaining ${regularEvents.length - 3} events only added to the drama.`,
            ];
            const pick = arr => arr[Math.floor(Math.random() * arr.length)];
            smallStories.push({
                title: pick(titleVariants),
                text: `${pick(introVariants)} ${regularEvents.length > 3 ? pick(moreVariants) + ' ' : ''}${pick(closingVariants)}`,
            });
        }

        // Additional special events (if headline was something else)
        for (let i = (stories[0].title.includes('DEFINED') ? 1 : 0); i < specialEvents.length; i++) {
            smallStories.push({
                title: `THE STRANGE CASE OF ${specialEvents[i].text.toUpperCase()}`,
                text: generateSpecialEventArticle(specialEvents[i], reviewYear),
                illustration: EVENT_ILLUSTRATIONS[specialEvents[i].text] || null,
            });
        }

        // Add up to 3 small stories
        for (let i = 0; i < Math.min(3, smallStories.length); i++) {
            stories.push(smallStories[i]);
        }

        // Try to add a rival filler story (pick a random active rival)
        if (gameState.rivals && gameState.rivals.length > 0) {
            const rival = gameState.rivals[Math.floor(Math.random() * gameState.rivals.length)];
            const rivalStory = pickRivalFiller(gameState, rival.id);
            if (rivalStory) stories.push(rivalStory);
        }

        // Always add one generic filler story
        stories.push(pickFiller(gameState));

        // If we still don't have enough stories, add another filler
        if (stories.length < 3) {
            stories.push(pickFiller(gameState));
        }

        return {
            date: `January ${gameState.year} — Year in Review ${reviewYear}`,
            stories,
        };
    }

    function generateSpecialEventArticle(evt, year) {
        const articles = {
            'ALIEN INVASION!': 'Residents of Helsinki are still processing the extraordinary events that unfolded this year when unidentified objects appeared over the city. Property values in affected areas plummeted, though tourism officials are cautiously optimistic about the long-term effects. "You can\'t buy this kind of publicity," one tourism board member noted.',
            'TONTTU INVASION!': 'In what locals are calling "the most Finnish thing to ever happen," tiny figures in red caps were spotted on rooftops across the city. Residential property values surged as tenants reported feeling "inexplicably cozy." Scientists remain baffled, while grandmothers across Finland simply nodded knowingly.',
            'MOOSE RUSH HOUR!': 'Helsinki\'s morning commute was disrupted in the most spectacular fashion when a herd of moose decided to use Mannerheimintie as their personal highway. While some property damage was reported, the incident generated worldwide media coverage and a significant tourism boost. "Only in Helsinki," commented an amused traffic officer.',
            'NOKIA COMEBACK!': 'The tech world was rocked by Nokia\'s announcement of its return to mobile phones. Office property values in Helsinki\'s tech districts — Ruoholahti, Jätkäsaari, Kamppi, and Sörnäinen — surged on the news. Former Nokia employees were seen weeping tears of joy in the streets of Espoo.',
            'NORTHERN LIGHTS OVER HELSINKI!': 'In a rare and breathtaking spectacle, the aurora borealis was clearly visible from Helsinki, painting the winter sky in shimmering greens and blues. Tourists flooded the city, filling hotels and restaurants to capacity. "I came for the design, but I stayed for the sky," said one awestruck visitor from Tokyo.',
            'GIANT RUBBER DUCK!': 'The mystery of South Harbour\'s giant rubber duck continues to captivate the nation. The enormous yellow bath toy appeared overnight with no explanation, and has since become Helsinki\'s most photographed attraction. City officials have quietly decided to let it stay. "It makes people happy," shrugged the mayor. "And honestly, we have no idea how to move it."',
            'ANGRY BIRD!': 'Eyewitnesses reported a large, red, spherical object hurtling across the Helsinki skyline at tremendous speed. Aviation authorities confirmed it was not an aircraft. Physicists noted the object followed a perfect parabolic trajectory. Mobile gaming veterans exchanged knowing glances.',
            'POLAR BEARS IN HELSINKI!': 'In scenes not witnessed since the Ice Age, polar bears were spotted roaming Helsinki\'s coastline and islands. Wildlife experts are baffled by their appearance this far south. "They seemed perfectly content," reported one incredulous park ranger from Seurasaari. The bears were last seen heading toward Suomenlinna, presumably in search of seals.',
            'SWEDISH INVASION!': 'In a development that has historians checking their calendars, Sweden has symbolically reclaimed Helsinki. District signs across the capital were overnight replaced with their Swedish-language equivalents — Kallio became Berghäll, Kamppi became Kampen, and Töölö became Tölö. A Swedish flag was hoisted at a prominent location while the opening bars of "Du gamla, du fria" echoed across Market Square. Finnish officials described the situation as "mostly harmless" while quietly noting the boost to tourism. "At least the street signs are bilingual anyway," shrugged one resident of Brunnsparken — sorry, Kaivopuisto.',
        };
        return articles[evt.text] || `The extraordinary event known as "${evt.text}" left Helsinki residents shocked and delighted in equal measure. The effects on the property market were significant, and analysts predict the reverberations will be felt for months to come.`;
    }

    return {
        generateDay1Paper,
        generateYearlyPaper,
        MONTH_NAMES,
    };
})();
