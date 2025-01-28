const { timeLog, timeStamp, time } = require('console');
const express = require('express');
const resizeImage = require('./resizeImages');
const fs = require('fs');
const path = require('path');
const sass = require('sass'); // Adăugăm pachetul sass
const app = express();

const vect_foldere = ["temp", "backup"]; // Adăugăm folderul backup

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

function afisareEroare(res, identificator, titlu, text, imagine) {
    const eroare = obGlobal.obErori.info_erori.find(er => er.identificator === identificator) || obGlobal.obErori.eroare_default;

    titlu = titlu || eroare.titlu;
    text = text || eroare.text;
    imagine = imagine || eroare.imagine;

    res.status(identificator).render('pagini/eroare', {
        titlu: titlu,
        text: text,
        imagine: imagine
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

app.use('/resurse*', (req, res, next) => {
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
    scssFiles.forEach(file => compileazaScss(file));
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
            if (data_min_quarter == im.sfert_ora) {
                galerieCuImagini.push(im);
            }
        }
        res.render('pagini/index', {ipUser: req.ip, gal:galerieCuImagini });
    });
});

app.get('/despre', (req, res) => {
  res.render('pagini/despre');
});

app.get('/video-vtt', (req, res) => {
    res.render('pagini/video-vtt');
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
        res.send(rezultatRadnare);
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