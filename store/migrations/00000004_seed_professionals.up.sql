WITH seeded_professionals (seed_key, full_name, phone, email, business_id, location, location_lat, location_lng, professions) AS (
    VALUES
        ('bratislava_plumber', 'Marek Novak', '+421905111201', 'marek.novak@yokaid.local', 'Novak voda servis', 'Bratislava, Slovensko', 48.1486, 17.1077, ARRAY['Inštalatér']),
        ('kosice_electrician', 'Peter Kovac', '+421905111202', 'peter.kovac@yokaid.local', 'Kovac elektro', 'Košice, Slovensko', 48.7164, 21.2611, ARRAY['Elektrikár']),
        ('zilina_carpenter', 'Jana Horvathova', '+421905111203', 'jana.horvathova@yokaid.local', 'Horvathova stolarska dielna', 'Žilina, Slovensko', 49.2232, 18.7394, ARRAY['Tesár', 'Stolár']),
        ('nitra_garden_architect', 'Tomas Balaz', '+421905111204', 'tomas.balaz@yokaid.local', 'Balaz zahrady', 'Nitra, Slovensko', 48.3061, 18.0764, ARRAY['Záhradný architekt']),
        ('trnava_painter', 'Lucia Benkova', '+421905111205', 'lucia.benkova@yokaid.local', 'Benkova malovanie', 'Trnava, Slovensko', 48.3774, 17.5872, ARRAY['Maliar']),
        ('presov_tiler', 'Martin Siska', '+421905111206', 'martin.siska@yokaid.local', 'Siska obklady', 'Prešov, Slovensko', 49.0018, 21.2393, ARRAY['Obkladač']),
        ('banska_bystrica_architect', 'Eva Urbanova', '+421905111207', 'eva.urbanova@yokaid.local', 'Urbanova atelier', 'Banská Bystrica, Slovensko', 48.7363, 19.1462, ARRAY['Architekt', 'Dizajnér interiérov']),
        ('trencin_mechanic', 'Roman Dudas', '+421905111208', 'roman.dudas@yokaid.local', 'Dudas autoservis', 'Trenčín, Slovensko', 48.8945, 18.0444, ARRAY['Auto mechanik']),
        ('poprad_photographer', 'Michaela Krizanova', '+421905111209', 'michaela.krizanova@yokaid.local', 'Krizanova foto', 'Poprad, Slovensko', 49.0614, 20.2975, ARRAY['Fotograf']),
        ('martin_lawyer', 'Andrej Valach', '+421905111210', 'andrej.valach@yokaid.local', 'Valach legal', 'Martin, Slovensko', 49.0658, 18.9216, ARRAY['Advokát', 'Právnik']),
        ('dunajska_streda_hairdresser', 'Katarina Meszarosova', '+421905111211', 'katarina.meszarosova@yokaid.local', 'Salon Katarina', 'Dunajská Streda, Slovensko', 47.9927, 17.6121, ARRAY['Kaderník']),
        ('prague_web_developer', 'Daniel Svoboda', '+420605111212', 'daniel.svoboda@yokaid.local', 'Svoboda web studio', 'Praha, Česko', 50.0755, 14.4378, ARRAY['Web developer', 'Programátor'])
),
inserted_professionals AS (
    INSERT INTO professionals (full_name, phone, email, business_id, location, location_lat, location_lng)
    SELECT full_name, phone, email, business_id, location, location_lat, location_lng
    FROM seeded_professionals
    ON CONFLICT (phone) DO NOTHING
    RETURNING id, phone
)
INSERT INTO professional_professions (professional_id, profession_id)
SELECT ip.id, p.id
FROM inserted_professionals ip
JOIN seeded_professionals sp ON sp.phone = ip.phone
JOIN professions p ON p.title->>'sk_SK' = ANY(sp.professions)
ON CONFLICT DO NOTHING;

WITH seeded_reviews (payment_id, user_id, professional_phone, text, rating, created_at) AS (
    VALUES
        ('seedrev000000000000000000000001', 'seeduser00000001', '+421905111201', 'Rýchla oprava batérie v kúpeľni, prišiel presne v dohodnutom čase a dopredu vysvetlil, čo bude meniť. Po práci všetko otestoval a nechal priestor čistý.', 5, '2026-02-03 09:15:00'::timestamp),
        ('seedrev000000000000000000000002', 'seeduser00000002', '+421905111201', 'Pomohol aj s odporúčaním materiálu a nechal po sebe poriadok. Ocenil som, že neponúkal zbytočne drahé riešenie a vybral praktickú možnosť do staršieho bytu.', 5, '2026-03-12 16:40:00'::timestamp),
        ('seedrev000000000000000000000003', 'seeduser00000003', '+421905111202', 'Vymenil ističe a všetko jasne vysvetlil. Férová cena, dobrá komunikácia pred príchodom a po dokončení ešte skontroloval celý rozvádzač, nie iba nahlásený problém.', 5, '2026-01-21 11:05:00'::timestamp),
        ('seedrev000000000000000000000004', 'seeduser00000004', '+421905111202', 'Práca bola hotová rýchlo, len termín sme museli raz posunúť. Inak prebehlo všetko bez komplikácií, prišiel pripravený a upratal aj drobný neporiadok po vŕtaní.', 4, '2026-04-02 18:20:00'::timestamp),
        ('seedrev000000000000000000000005', 'seeduser00000005', '+421905111203', 'Knižnica na mieru vyzerá presne podľa návrhu. Oceňujem presné meranie, dobré doladenie detailov pri montáži a trpezlivú komunikáciu pri výbere farby a úchytiek.', 5, '2026-02-17 14:10:00'::timestamp),
        ('seedrev000000000000000000000006', 'seeduser00000006', '+421905111203', 'Precízna stolárska práca, dobrá komunikácia počas celej zákazky. Termín bol dodržaný, rozpočet sedel s dohodou a výsledok pôsobí pevne aj po každodennom používaní.', 5, '2026-05-06 10:30:00'::timestamp),
        ('seedrev000000000000000000000007', 'seeduser00000007', '+421905111204', 'Návrh záhrady bol praktický a prispôsobený rozpočtu. Páčilo sa mi, že rátal s údržbou počas roka a vybral rastliny vhodné pre slnečné aj tienisté miesta.', 5, '2026-03-08 08:50:00'::timestamp),
        ('seedrev000000000000000000000008', 'seeduser00000008', '+421905111204', 'Dostal som aj konkrétny plán výsadby a údržby. Konzultácia nebola uponáhľaná, prešli sme viac variantov a výsledný návrh sa dal jednoducho posunúť realizačnej firme.', 4, '2026-06-11 12:25:00'::timestamp),
        ('seedrev000000000000000000000009', 'seeduser00000009', '+421905111205', 'Vymaľovanie bytu prebehlo čisto a bez zbytočných prestojov. Nábytok bol dobre zakrytý, hrany sú spravené presne a po dokončení nebolo treba riešiť žiadne opravy.', 5, '2026-01-29 15:45:00'::timestamp),
        ('seedrev000000000000000000000010', 'seeduser00000010', '+421905111205', 'Farby boli odporúčané dobre, výsledok pôsobí profesionálne. Pomohla aj s kombináciou odtieňov medzi izbami a upozornila na stenu, ktorú bolo treba pred maľovaním opraviť.', 4, '2026-04-19 09:35:00'::timestamp),
        ('seedrev000000000000000000000011', 'seeduser00000011', '+421905111206', 'Kúpeľňový obklad je rovný, detaily pri rohoch sú pekne dokončené. Dohodnutý harmonogram sedel a priebežne posielal fotky, takže sme vedeli riešiť drobnosti bez zdržania.', 5, '2026-02-24 13:00:00'::timestamp),
        ('seedrev000000000000000000000012', 'seeduser00000012', '+421905111206', 'Spoľahlivý obkladač, po obhliadke poslal jasnú kalkuláciu. Materiál si vedel zabezpečiť sám, poradil so škárovacou hmotou a výsledok vyzerá veľmi čisto.', 5, '2026-05-27 17:10:00'::timestamp),
        ('seedrev000000000000000000000013', 'seeduser00000013', '+421905111207', 'Návrh rekonštrukcie bol premyslený a dobre využil malý priestor. Dostali sme viac riešení úložných miest, reálne rozmery nábytku a odporúčania k osvetleniu.', 5, '2026-03-15 10:55:00'::timestamp),
        ('seedrev000000000000000000000014', 'seeduser00000014', '+421905111207', 'Pomohla s dispozíciou aj výberom materiálov, spolupráca bola vecná. Vedela povedať, kde sa oplatí priplatiť a kde stačí jednoduchšie riešenie bez straty kvality.', 4, '2026-06-02 14:35:00'::timestamp),
        ('seedrev000000000000000000000015', 'seeduser00000015', '+421905111208', 'Diagnostika auta bola rýchla a oprava vydržala bez problémov. Pred výmenou dielov zavolal, vysvetlil cenu a ukázal aj pôvodnú chybu po demontáži.', 5, '2026-01-18 08:25:00'::timestamp),
        ('seedrev000000000000000000000016', 'seeduser00000016', '+421905111208', 'Dobrá komunikácia, upozornil aj na veci, ktoré netreba riešiť hneď. Páčilo sa mi, že netlačil na zbytočné opravy a dal rozumný plán údržby auta.', 4, '2026-04-25 11:45:00'::timestamp),
        ('seedrev000000000000000000000017', 'seeduser00000017', '+421905111209', 'Fotky z rodinnej oslavy mali prirodzenú atmosféru. Zachytila veľa nenútených momentov, dobre pracovala so svetlom a výber upravených záberov bol veľmi vyvážený.', 5, '2026-05-13 19:15:00'::timestamp),
        ('seedrev000000000000000000000018', 'seeduser00000018', '+421905111209', 'Odovzdanie bolo rýchle a výber záberov veľmi dobrý. Komunikácia pred fotením pomohla nastaviť očakávania a počas akcie pôsobila nenápadne, no pohotovo.', 5, '2026-07-04 16:00:00'::timestamp),
        ('seedrev000000000000000000000019', 'seeduser00000019', '+421905111210', 'Konzultácia bola konkrétna a dostal som jasné ďalšie kroky. Vysvetlil riziká zrozumiteľne, pripravil stručné zhrnutie a odporučil, ktoré dokumenty doplniť ako prvé.', 5, '2026-02-09 09:40:00'::timestamp),
        ('seedrev000000000000000000000020', 'seeduser00000020', '+421905111210', 'Dokumenty pripravil prehľadne, komunikácia bola bez zdržania. Na otázky odpovedal vecne, upozornil na možné termíny a celý proces pôsobil organizovane.', 4, '2026-06-22 13:30:00'::timestamp),
        ('seedrev000000000000000000000021', 'seeduser00000021', '+421905111211', 'Strih aj farba dopadli výborne, veľmi príjemný prístup. Pred začiatkom sme prešli predstavu aj možnosti vlasov a výsledok vyzeral dobre aj po niekoľkých umytiach.', 5, '2026-03-27 12:10:00'::timestamp),
        ('seedrev000000000000000000000022', 'seeduser00000022', '+421905111211', 'Objednanie bolo jednoduché a termín dodržaný na minútu. Salón bol čistý, atmosféra pokojná a odporúčania k starostlivosti doma boli praktické.', 5, '2026-07-15 10:20:00'::timestamp),
        ('seedrev000000000000000000000023', 'seeduser00000023', '+420605111212', 'Web dodal podľa zadania a dobre vyriešil aj responzívne detaily. Priebežne ukazoval stav práce, zapracoval pripomienky a pripravil aj jednoduché nasadenie.', 5, '2026-04-07 15:00:00'::timestamp),
        ('seedrev000000000000000000000024', 'seeduser00000024', '+420605111212', 'Technické veci vysvetlil zrozumiteľne a nasadenie prebehlo hladko. Po odovzdaní ešte opravil drobné texty, nastavil meranie návštevnosti a poslal stručný návod.', 5, '2026-07-21 09:05:00'::timestamp)
),
inserted_payments AS (
    INSERT INTO payments (id, user_id, product_id, created_at, state)
    SELECT payment_id, user_id, 'rev', created_at, 'paid'
    FROM seeded_reviews
    ON CONFLICT (id) DO NOTHING
    RETURNING id
)
INSERT INTO reviews (id, professional_id, text, rating, created_at)
SELECT sr.payment_id, p.id, sr.text, sr.rating, sr.created_at
FROM seeded_reviews sr
JOIN inserted_payments ip ON ip.id = sr.payment_id
JOIN professionals p ON p.phone = sr.professional_phone
ON CONFLICT DO NOTHING;
