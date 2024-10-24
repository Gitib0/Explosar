window.onload = function () {
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var W = window.innerWidth,
    H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;

  var particles = [];
  var lasers = [];
  var laserCount = 5; // Nombre initial de lasers
  const container = document.body; // Associer les images au body
  const URL = "https://randomfox.ca/images/";
  const minSpeed = 1;
  const maxSpeed = 10;
  const minSize = 30; // Taille minimale des images
  const maxSize = 150; // Taille maximale des images
  const maxImageChangesPerMinute = 10; // Maximum d'images changées par minute
  const changeInterval = (60 / maxImageChangesPerMinute) * 1000; // Intervalle de changement d'image en millisecondes

  function getRandomNumber() {
    return Math.floor(Math.random() * 100);
  }

  // Fonction pour créer une image associée au laser
  function createLaser() {
    const img = document.createElement("img");
    img.src = `${URL}${getRandomNumber()}.jpg`;
    img.style.position = "absolute";
    img.style.width = `${minSize + Math.random() * (maxSize - minSize)}px`; // Taille initiale aléatoire
    img.style.height = "auto";
    container.appendChild(img); // Ajoute l'image au body

    let changeCount = 0; // Compteur de changements d'image

    return {
      posX: Math.random() * W,
      posY: Math.random() * H,
      velX: Math.random() * 10 - 5, // Vitesse aléatoire entre -5 et 5
      velY: Math.random() * 10 - 5,
      size: minSize + Math.random() * (maxSize - minSize),
      img: img, // Associe l'image au laser
      changeImage: () => {
        // Fonction pour changer l'image
        if (changeCount < maxImageChangesPerMinute) {
          // Vérifie si le maximum n'est pas atteint
          img.src = `${URL}${getRandomNumber()}.jpg`;
          laser.size = minSize + Math.random() * (maxSize - minSize); // Changer la taille aussi si souhaité
          img.style.width = `${laser.size}px`; // Mettre à jour la taille de l'image
          changeCount++; // Incrémente le compteur
        }
      },
    };
  }

  // Créer plusieurs lasers avec des images aléatoires
  for (let i = 0; i < laserCount; i++) {
    lasers.push(createLaser());
  }

  var particle_count = 200; // Augmente le nombre de particules
  for (var i = 0; i < particle_count; i++) {
    particles.push(new particle());
  }

  function particle() {
    this.speed = { x: -2.5 + Math.random() * 5, y: -15 + Math.random() * 10 };
    this.location = { x: lasers[0].posX, y: lasers[0].posY };
    this.radius = 10 + Math.random() * 20;
    this.life = 20 + Math.random() * 10;
    this.remaining_life = this.life;
    this.r = Math.round(Math.random() * 255);
    this.g = Math.round(Math.random() * 255);
    this.b = Math.round(Math.random() * 255);
  }

  function draw() {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.beginPath();
      p.opacity = Math.round((p.remaining_life / p.life) * 100) / 100;
      var gradient = ctx.createRadialGradient(
        p.location.x,
        p.location.y,
        0,
        p.location.x,
        p.location.y,
        p.radius
      );
      gradient.addColorStop(
        0,
        "rgba(" + p.r + ", " + p.g + ", " + p.b + ", " + p.opacity + ")"
      );
      gradient.addColorStop(
        0.5,
        "rgba(" + p.r + ", " + p.g + ", " + p.b + ", " + p.opacity + ")"
      );
      gradient.addColorStop(
        1,
        "rgba(" + p.r + ", " + p.g + ", " + p.b + ", 0)"
      );
      ctx.fillStyle = gradient;
      ctx.arc(p.location.x, p.location.y, p.radius, Math.PI * 2, false);
      ctx.fill();

      p.remaining_life--;
      p.radius--;
      p.location.x += p.speed.x;
      p.location.y += p.speed.y;

      if (p.remaining_life < 0 || p.radius < 0) {
        particles[i] = new particle();
        let randomLaser = lasers[Math.floor(Math.random() * lasers.length)];
        particles[i].location.x = randomLaser.posX + randomLaser.size / 2;
        particles[i].location.y = randomLaser.posY + randomLaser.size / 2;
      }
    }
  }

  function moveLasers() {
    lasers.forEach((laser) => {
      laser.posX += laser.velX;
      laser.posY += laser.velY;

      // Limites pour les bords
      if (laser.posX <= 0 || laser.posX + laser.size >= W) {
        laser.velX = -laser.velX;
      }
      if (laser.posY <= 0 || laser.posY + laser.size >= H) {
        laser.velY = -laser.velY;
      }

      // Appliquer les nouvelles positions aux images
      laser.img.style.left = `${laser.posX}px`;
      laser.img.style.top = `${laser.posY}px`;
      laser.img.style.width = `${laser.size}px`; // Ajuste la taille de l'image

      // Changer l'image après un certain intervalle si le maximum n'est pas atteint
      setTimeout(laser.changeImage, changeInterval);
    });

    requestAnimationFrame(moveLasers);
  }

  moveLasers();
  setInterval(draw, 33);

  // Gestion des boutons pour ajouter ou modifier les lasers
  document.getElementById("addLaser").addEventListener("click", () => {
    lasers.push(createLaser());
  });

  document.getElementById("removeLaser").addEventListener("click", () => {
    if (lasers.length > 1) {
      const removedLaser = lasers.pop();
      container.removeChild(removedLaser.img); // Retirer l'image du DOM
    }
  });

  // Augmente la vitesse tout en conservant la direction
  document.getElementById("increaseSpeed").addEventListener("click", () => {
    lasers.forEach((laser) => {
      const speedFactor = 1.2; // Facteur d'augmentation de vitesse
      laser.velX *= speedFactor;
      laser.velY *= speedFactor;
      // Limiter les vitesses pour ne pas dépasser maxSpeed
      laser.velX = Math.max(-maxSpeed, Math.min(maxSpeed, laser.velX));
      laser.velY = Math.max(-maxSpeed, Math.min(maxSpeed, laser.velY));
    });
  });

  // Diminue la vitesse tout en conservant la direction
  document.getElementById("decreaseSpeed").addEventListener("click", () => {
    lasers.forEach((laser) => {
      const speedFactor = 0.8; // Facteur de diminution de vitesse
      laser.velX *= speedFactor;
      laser.velY *= speedFactor;
      // Limiter les vitesses pour ne pas descendre en dessous de minSpeed
      laser.velX = Math.max(-maxSpeed, Math.min(maxSpeed, laser.velX));
      laser.velY = Math.max(-maxSpeed, Math.min(maxSpeed, laser.velY));
    });
  });

  document.getElementById("increaseSize").addEventListener("click", () => {
    lasers.forEach((laser) => {
      laser.size = Math.min(maxSize, laser.size * 1.2);
      laser.img.style.width = `${laser.size}px`; // Met à jour la taille de l'image
    });
  });

  document.getElementById("decreaseSize").addEventListener("click", () => {
    lasers.forEach((laser) => {
      laser.size = Math.max(minSize, laser.size * 0.8);
      laser.img.style.width = `${laser.size}px`; // Met à jour la taille de l'image
    });
  });

  window.addEventListener("resize", () => {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
  });
  let loopRunning = false;
  let intervalId;

  document.getElementById("explosar").addEventListener("click", function (e) {
    if (!loopRunning) {
      loopRunning = true;
      intervalId = setInterval(randomize, 1000 / 60);
    } else {
      loopRunning = false;
      clearInterval(intervalId);
      document.querySelectorAll("*").forEach((e) => {
        e.style.background = null;
        e.style.border = null;
        e.style.boxShadow = null;
        e.style.color = null;
        e.style.display = null; // Réinitialise l'affichage
        e.style.flexDirection = null; // Réinitialise la direction du flex
        e.style.justifyContent = null; // Réinitialise le contenu justifié
        e.style.alignContent = null; // Réinitialise l'alignement du contenu
      });
    }
  });

  function randomFlex() {
    const direction = ["row", "column"];
    const content = ["start", "center", "end", "space-between", "space-around"];
    document.querySelectorAll("*").forEach((e) => {
      e.style.display = "flex";
      e.style.flexDirection = direction[Math.floor(Math.random() * 2)];
      e.style.justifyContent = content[Math.floor(Math.random() * 5)];
      e.style.alignContent = content[Math.floor(Math.random() * 5)];
    });
  }

  function randomColor() {
    document.querySelectorAll("*").forEach((e) => {
      e.style.background =
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
      e.style.border =
        Math.random() * 25 +
        "px solid " +
        "#" +
        ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
      e.style.boxShadow =
        "-5px 0 0 10px " +
        "#" +
        ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0") +
        "," +
        "0 -5px 0 10px " +
        "#" +
        ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0") +
        "," +
        "0 5px 0 10px " +
        "#" +
        ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0") +
        "," +
        "5px 0 0 10px " +
        "#" +
        ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
      e.style.color =
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
    });
  }

  function randomText() {
    const weight = ["bold", "lighter", "bolder", "normal"];
    const texts = [
      "J'aime le poulet ! ",
      "Le poulet c'est trop bon ! ",
      "Le poulet frit hmm quel délice ! ",
      "C'est vraiment incroyable ça c'est quoi? Du poulet ! ",
      "Charly t'aime bien le poulet? Moi oui!",
      "Fares t'aime bien le poulet? Bah moi aussi !",
    ];

    document.querySelectorAll("span").forEach((e) => {
      const randomIndex = Math.floor(Math.random() * texts.length);
      e.textContent = texts[randomIndex]; // Remplace le contenu par un texte aléatoire
      e.style.fontSize = Math.random() * 10 + "em"; // Taille aléatoire
      e.style.fontWeight = weight[Math.floor(Math.random() * 4)]; // Poids aléatoire
    });
  }
  function randomButton() {
    const button = document.getElementById("explosar");
    const W = window.innerWidth;
    const H = window.innerHeight;

    // Générer des positions aléatoires
    const posX = Math.random() * (W - button.offsetWidth); // Largeur du bouton pour éviter qu'il sorte de l'écran
    const posY = Math.random() * (H - button.offsetHeight); // Hauteur du bouton pour éviter qu'il sorte de l'écran

    // Générer une taille aléatoire
    const newWidth = Math.random() * 200 + 50; // Taille entre 50px et 250px
    const newHeight = Math.random() * 100 + 30; // Taille entre 30px et 130px

    // Appliquer les nouvelles styles
    button.style.position = "absolute"; // Assurez-vous que le bouton a une position absolue
    button.style.left = `${posX}px`;
    button.style.top = `${posY}px`;
    button.style.width = `${newWidth}px`;
    button.style.height = `${newHeight}px`;
}


  function randomize() {
    randomColor();
    randomFlex();
    randomText();
    randomButton()
  }
};
