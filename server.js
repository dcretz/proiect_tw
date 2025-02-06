const { timeLog, timeStamp, time } = require('console');
const express = require('express');
const resizeImage = require('./resizeImages');
const fs = require('fs');
const path = require('path');
const sass = require('sass'); // Adăugăm pachetul sass
const pg = require('pg');
const app = express();

const vect_foldere = ["temp", "backup"]; // Adăugăm folderul backup

const Client=pg.Client;

const client = new Client({
    database:"proiect",
    user:"admindio",
    password:"admin",
    host:"localhost",
    port:5432
});
var categoriEnum = [];
client.connect();
client.query("SELECT unnest(enum_range(NULL::genuri_carte)) AS categorie;", function(err,rezultat){
	categoriEnum = rezultat.rows.map( row => row.categorie );
	console.log(categoriEnum); 
});

vect_foldere.forEach((folder) => {
    const folderPath = path.join(__dirname, folder);
 
    if(!fs.existsSync(folderPath)){
      fs.mkdirSync(folderPath, {recursive: true});
      console.log(`Folderul "${folder}" a fost creat la: ${folderPath} `);
    } else {
      console.log(`Folderul "${folder}" exista la: ${folderPath} `);
    }
});

app.set('view engine', 'ejs');

const obGlobal = {
    obErori: null,
    folderScss: path.join(__dirname, 'resurse', 'css'), // Definim folderScss
    folderCss: path.join(__dirname, 'resurse', 'css')   // Definim folderCss
};

function initErori() {
    fs.readFile('./erori.json', 'utf-8', (err, data) => {
        if (err) {
            console.error('Eroare la citirea fisierului de erori:', err);
            return;
        }
        const erori = JSON.parse(data); 

        const eroriCuImagini = erori.info_erori.map(er => {
            er.imagine = erori.cale_baza + er.imagine; 
            console.log(er.imagine);
            return er;
        });

        obGlobal.obErori = {
            eroare_default: erori.eroare_default,
            info_erori: eroriCuImagini
        };
    });
}

function afisareEroare(res, identificator, titlu, text, imagine, descriere) {
    const eroare = obGlobal.obErori.info_erori.find(er => er.identificator === identificator) || obGlobal.obErori.eroare_default;

    titlu = titlu || eroare.titlu;
    text = text || eroare.text;
    imagine = imagine || eroare.imagine;
	descriere = descriere || eroare.descriere;

    res.status(identificator).render('pagini/eroare', {
        titlu: titlu,
        text: text,
        imagine: imagine,
		descriere: descriere
    });
}

initErori();

app.use((req, res, next) => {
    if (req.path.endsWith('.ejs')) {
        afisareEroare(res, 400);
    }
    next();
});

app.get('/favicon.ico', (req, res) => {
    const faviconPath = path.join(__dirname, 'resurse', 'imagini', 'favicon.ico');
    res.sendFile(faviconPath, (err) => {
        if (err) {
            console.error("Eroare la trimiterea favicon:", err);
            afisareEroare(res,500,"Favicon error", `Eroare la trimiterea favicon:${err}`);
        }
    });
});

app.use('/resurse/', express.static('resurse'));

app.use('/resurse/*', (req, res, next) => {
    const resourcePath = path.join(__dirname, 'public', req.path);
    if (!fs.existsSync(resourcePath) || fs.lstatSync(resourcePath).isDirectory()) {
        afisareEroare(res, 403);
    }
    next();
});

function compileazaScss(caleScss, caleCss) {
    const scssPath = path.isAbsolute(caleScss) ? caleScss : path.join(obGlobal.folderScss, caleScss);
    const cssPath = caleCss ? (path.isAbsolute(caleCss) ? caleCss : path.join(obGlobal.folderCss, caleCss)) : scssPath.replace(/\.scss$/, '.css');

    const backupPath = path.join(__dirname, 'backup', 'resurse', 'css');
    if (!fs.existsSync(backupPath)) {
		fs.mkdirSync(backupPath, { recursive: true });
	}
	
	if (fs.existsSync(cssPath)) {
		const cssBackupPath = path.join(backupPath, path.basename(cssPath));
		try {
			fs.copyFileSync(cssPath, cssBackupPath);
		} catch (err) {
			console.error('Eroare la copierea fișierului CSS în backup:', err);
		}
	}
	
	try {
		const result = sass.renderSync({ file: scssPath });
		fs.writeFileSync(cssPath, result.css);
		console.log(`Fișierul SCSS ${scssPath} a fost compilat în ${cssPath}`);
	} catch (err) {
		console.error('Eroare la compilarea fișierului SCSS:', err);
	}
}

function compileazaToateScss() {
    const scssFiles = fs.readdirSync(obGlobal.folderScss).filter(file => file.endsWith('.scss'));
    scssFiles.forEach(file => {
        compileazaScss(file);
        // console.log(`Fișierul ${file} a fost compilat.`);
    });
}

compileazaToateScss();

fs.watch(obGlobal.folderScss, (eventType, filename) => {
    if (filename && filename.endsWith('.scss')) {
        console.log(`Fișierul ${filename} a fost modificat. Se compilează...`);
        compileazaScss(filename);
    }
});

app.get(['/', '/index', '/home'], (req, res) => {
    const galeriePath = path.join(__dirname, 'galerie.json');
	const random = Math.floor(Math.random()*10%3)+2;
	// const random = 3;
	console.log(random);
    fs.readFile(galeriePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Eroare la citirea fisierului galerie:', err);
            return;
        }
        const galerie = JSON.parse(data); 
        const galerieCuImagini = [];
        for (let i = 0; i < galerie.imagini.length; i++) {
            let im = galerie.imagini[i];
            im.imagine = galerie.cale_galerie + im.cale_imagine; 
            const data_min_quarter = Math.floor(new Date().getMinutes() / 15) + 1;
			
			// modificare in timpul prezentarii 

			// if (data_min_quarter == 1){
			// 	data_min_quarter = 4;
			// }

            if (data_min_quarter == im.sfert_ora) {
                galerieCuImagini.push(im);
            }
        }
		const galRandom = [];
		let rands = [];
		// console.log("galerie.imagini.length:");  
		// console.log(galerie.imagini.length);
		do{
			let imRand = Math.floor(Math.random()*100%galerie.imagini.length)+1;
			// console.log(imRand);
            if(!rands.includes(imRand) && (imRand < galerie.imagini.length)){
				rands.push(imRand);
				if(galerie.imagini[imRand].titlu.length <= 15){
					galRandom.push(galerie.imagini[imRand]);
				} 
			} 
			// console.log(rands);
			// console.log(galRandom); 
		}while(galRandom.length !== (random*random))
        res.render('pagini/index', {ipUser: req.ip, gal:galerieCuImagini, dinam:galRandom, categorii:categoriEnum });
    });
});

app.get('/despre', (req, res) => {
  res.render('pagini/despre',{categorii:categoriEnum});
});

app.get('/galerie', (req, res) => {
	const galeriePath = path.join(__dirname, 'galerie.json');
	const random = Math.floor(Math.random()*10%3)+2;
	// const random = 3;
	console.log(random);
    fs.readFile(galeriePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Eroare la citirea fisierului galerie:', err);
            return;
        }
        const galerie = JSON.parse(data); 
        const galerieCuImagini = [];
        for (let i = 0; i < galerie.imagini.length; i++) {
            let im = galerie.imagini[i];
            im.imagine = galerie.cale_galerie + im.cale_imagine; 
            const data_min_quarter = Math.floor(new Date().getMinutes() / 15) + 1;
			
			// modificare in timpul prezentarii 

			// if (data_min_quarter == 1){
			// 	data_min_quarter = 4;
			// }

            if (data_min_quarter == im.sfert_ora) {
                galerieCuImagini.push(im);
            }
        }
		const galRandom = [];
		let rands = [];
		// console.log("galerie.imagini.length:");  
		// console.log(galerie.imagini.length);
		do{
			let imRand = Math.floor(Math.random()*100%galerie.imagini.length)+1;
			// console.log(imRand);
            if(!rands.includes(imRand) && (imRand < galerie.imagini.length)){
				rands.push(imRand);
				if(galerie.imagini[imRand].titlu.length <= 15){
					galRandom.push(galerie.imagini[imRand]);
				} 
			} 
			// console.log(rands);
			// console.log(galRandom); 
		}while(galRandom.length !== (random*random))
        res.render('pagini/galerie', {ipUser: req.ip, gal:galerieCuImagini, dinam:galRandom, categorii:categoriEnum });
    });
  });


  app.get('/produse/:categorie?', async (req, res) => {
    const categorie = req.params.categorie || 'toate';

    try {
        let query, params;
        
        if (categorie === 'toate') {
            query = "SELECT * FROM carti";
            params = [];
        } else {
            query = "SELECT * FROM carti WHERE gen_carte = $1";
            params = [categorie];
        }

        const { rows: produse } = await client.query(query, params); 

        console.log("Produse:", produse);

        res.render('pagini/produse', { categorii: categoriEnum, produse }); 
    } catch (err) {
        console.error("Eroare la interogare:", err);
        res.status(500).send("Eroare la preluarea produselor");
    }
});


app.get('/produse/:categorie/:numeProdus', async (req, res) => {
    const { categorie, numeProdus } = req.params;

    try {
        const query = "SELECT * FROM carti WHERE nume = $1 AND gen_carte = $2";
        const params = [numeProdus, categorie];

        const { rows } = await client.query(query, params);

        if (rows.length === 0) {
            return res.status(404).send("Produsul nu a fost găsit.");
        }

        const produs = rows[0];

        res.render('pagini/produs', {categorii: categoriEnum, produs }); 
    } catch (err) {
        console.error("Eroare la interogare:", err);
        res.status(500).send("Eroare la preluarea produsului");
    }
});


app.get('/video-vtt', (req, res) => {
    res.render('pagini/video-vtt', {categorii:categoriEnum});
});

app.get('/*', (req, res) => {
    const requestedPage = req.params[0]; 
    
    res.render(`pagini/${requestedPage}`, (eroare, rezultatRadnare) => {
      if (eroare) {
        if (eroare.message.startsWith('Failed to lookup view')) {
          afisareEroare(res, 404);
        } else {
          afisareEroare(res, 500);
        }
      } else {
        res.send(rezultatRadnare, {categorii:categoriEnum});
      }
    });
});

const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(__dirname);
    console.log(__filename);
    console.log(process.cwd());
});