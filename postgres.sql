
CREATE TYPE tipuri_produse AS ENUM('carti', 'filme', 'papetarie', 'ceai');
CREATE TYPE genuri_carte AS ENUM('fictiune', 'istorie', 'psihologie', 'religie', 'tehnologie');

CREATE TABLE IF NOT EXISTS carti (
	id serial PRIMARY KEY,
	nume VARCHAR(50) UNIQUE NOT NULL,
	descriere TEXT,
	imagine VARCHAR(300),
	pret NUMERIC (8,2) NOT NULL,
	tip_produs tipuri_produse DEFAULT 'carti',
	gen_carte genuri_carte NOT NULL DEFAULT 'fictiune',
	pagini INT NOT NULL,
	data_inreg DATE DEFAULT current_timestamp,
	semn_de_carte BOOLEAN NOT NULL DEFAULT TRUE,
	autor VARCHAR [] NOT NULL
);

INSERT INTO carti (nume, descriere, imagine, pret, tip_produs, gen_carte, pagini, data_inreg, semn_de_carte, autor)
VALUES
('Misterul Templierilor', 'O carte despre enigmele cavalerilor templieri.', 'templari.jpg', 59.99, 'carti', 'istorie', 350, CURRENT_DATE, TRUE, ARRAY['John Smith']),
('Gandeste si devii bogat', 'Un ghid despre succes si motivatie.', 'gandeste.jpg', 45.50, 'carti', 'psihologie', 280, CURRENT_DATE, TRUE, ARRAY['Napoleon Hill']),
('Povestea Noastra', 'O calatorie prin istoria familiei regale.', 'povestea.jpg', 78.20, 'carti', 'istorie', 420, CURRENT_DATE, FALSE, ARRAY['Sarah Johnson']),
('Secretele Universului', 'O explorare a marilor mistere cosmice.', 'univers.jpg', 99.99, 'carti', 'tehnologie', 500, CURRENT_DATE, TRUE, ARRAY['Albert Newton']),
('Biblia Ilustrata', 'O versiune ilustrata a Bibliei.', 'biblia.jpg', 120.00, 'carti', 'religie', 600, CURRENT_DATE, TRUE, ARRAY['Colectiv']),
('Magia Gandirii', 'Cum sa iti imbunatatesti viata prin gandire pozitiva.', 'magia.jpg', 39.90, 'carti', 'psihologie', 250, CURRENT_DATE, TRUE, ARRAY['David Schwartz']),
('Programare in Python', 'Un ghid complet pentru incepatori.', 'python.jpg', 85.00, 'carti', 'tehnologie', 350, CURRENT_DATE, FALSE, ARRAY['Mark Lutz']),
('Istoria Europei', 'O analiza detaliata a istoriei europene.', 'europa.jpg', 110.75, 'carti', 'istorie', 480, CURRENT_DATE, TRUE, ARRAY['Norman Davies']),
('Arta Razboiului', 'Strategii clasice pentru succes.', 'arta.jpg', 60.99, 'carti', 'istorie', 220, CURRENT_DATE, TRUE, ARRAY['Sun Tzu']),
('Puterea Prezentului', 'O abordare spirituala a vietii moderne.', 'prezent.jpg', 49.99, 'carti', 'psihologie', 200, CURRENT_DATE, FALSE, ARRAY['Eckhart Tolle']),
('Scrisori Catre Dumnezeu', 'Reflectii spirituale.', 'scrisori.jpg', 72.50, 'carti', 'religie', 310, CURRENT_DATE, TRUE, ARRAY['Neale Donald Walsch']),
('Creierul si Inteligenta Artificiala', 'Impactul AI asupra omenirii.', 'ai.jpg', 89.99, 'carti', 'tehnologie', 400, CURRENT_DATE, TRUE, ARRAY['Nick Bostrom']),
('Confesiunile unui Preot', 'Marturii din spatele altarului.', 'confesiuni.jpg', 55.60, 'carti', 'religie', 320, CURRENT_DATE, TRUE, ARRAY['John Michaels']),
('Ghid de Supravietuire', 'Cum sa te descurci in situatii extreme.', 'supravietuire.jpg', 77.20, 'carti', 'tehnologie', 450, CURRENT_DATE, FALSE, ARRAY['Bear Grylls']),
('Timpul si Relativitatea', 'O explicatie simplificata a teoriei relativitatii.', 'relativitate.jpg', 95.00, 'carti', 'tehnologie', 380, CURRENT_DATE, TRUE, ARRAY['Stephen Hawking']),
('De la Zero la Unu', 'Despre inovatie si antreprenoriat.', 'zero.jpg', 68.40, 'carti', 'tehnologie', 290, CURRENT_DATE, TRUE, ARRAY['Peter Thiel']),
('Psihologia Maselor', 'Comportamentul colectiv analizat.', 'mase.jpg', 54.90, 'carti', 'psihologie', 260, CURRENT_DATE, TRUE, ARRAY['Gustave Le Bon']),
('Batalia pentru Religie', 'Un studiu asupra evolutiei credintelor.', 'batalia.jpg', 79.30, 'carti', 'religie', 350, CURRENT_DATE, FALSE, ARRAY['Richard Dawkins']),
('Codul Genetic', 'Cum ne influenteaza ADN-ul.', 'genetic.jpg', 88.20, 'carti', 'tehnologie', 420, CURRENT_DATE, TRUE, ARRAY['Francis Collins']),
('Viata dupa Moarte', 'Explorarea lumii spirituale.', 'moarte.jpg', 73.00, 'carti', 'religie', 330, CURRENT_DATE, TRUE, ARRAY['Raymond Moody']);
