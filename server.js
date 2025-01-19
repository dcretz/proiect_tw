const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const vect_foldere = ["temp"];

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
    obErori: null
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

app.get(['/', '/index', '/home'], (req, res) => {
    res.render('pagini/index', {ipUser: req.ip});
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
