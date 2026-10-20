
const usuarioGitHub = "RocelGerl";

const listaProyectos = document.getElementById("projectList");
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

const proyectosDeseados = [
    {
        nombre: "Bufete de Abogados",
        buscar: ["bufete de abogados", "bufete"]
    },
    {
        nombre: "Don Corleone",
        buscar: ["don corleone", "don corleone"]
    },
    {
        nombre: "CADIPAS",
        buscar: ["cadipas"]
    },
    {
        nombre: "Sazón de Mar",
        buscar: ["sazon de mar", "sazón de mar"]
    },
    {
        nombre: "Milton Tours",
        buscar: ["milton tours"]
    },
    {
        nombre: "Café Esencia",
        buscar: ["cafe esencia", "café esencia"]
    },
    {
        nombre: "Scaperoom",
        buscar: ["scaperoom", "scape room", "escape room"]
    },
    {
        nombre: "Akila",
        buscar: ["akila"]
    },
    {
        nombre: "Minibus",
        buscar: ["minibus", "minibús"]
    }
];

const coloresTecnologias = {
    HTML: "tech-html",
    CSS: "tech-css",
    JavaScript: "tech-javascript",
    PHP: "tech-php",
    Bootstrap: "tech-bootstrap",
    Python: "tech-python",
    Java: "tech-java",
    MySQL: "tech-mysql"
};

menuToggle.addEventListener("click", () => {
    const abierto = nav.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(abierto));
    menuToggle.setAttribute(
        "aria-label",
        abierto ? "Cerrar menú" : "Abrir menú"
    );
});

nav.querySelectorAll("a").forEach((enlace) => {
    enlace.addEventListener("click", () => {
        nav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Abrir menú");
    });
});

function escaparHTML(texto = "") {
    return String(texto).replace(/[&<>"']/g, (caracter) => {
        const entidades = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entidades[caracter];
    });
}

function normalizar(texto = "") {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

async function consultarJSON(url) {
    const respuesta = await fetch(url, {
        headers: {
            Accept: "application/vnd.github+json"
        }
    });

    if (!respuesta.ok) {
        throw new Error(`Error consultando GitHub: ${respuesta.status}`);
    }

    return respuesta.json();
}

async function consultarTecnologias(repo) {
    const tecnologias = new Set();

    try {
        const lenguajes = await consultarJSON(repo.languages_url);

        Object.keys(lenguajes).forEach((lenguaje) => {
            tecnologias.add(lenguaje);
        });
    } catch (error) {
        console.warn(`No se pudieron leer los lenguajes de ${repo.name}`);
    }

    // Bootstrap es un framework, no un lenguaje de programación.
    // Se comprueba si está mencionado en el README o los metadatos.
    try {
        const readme = await consultarJSON(
            `https://api.github.com/repos/${usuarioGitHub}/${encodeURIComponent(repo.name)}/readme`
        );

        let contenidoREADME = "";

        if (readme.download_url) {
            const respuestaREADME = await fetch(readme.download_url);

            if (respuestaREADME.ok) {
                contenidoREADME = await respuestaREADME.text();
            }
        }

        const metadatos = [
            repo.description || "",
            ...(repo.topics || [])
        ].join(" ");

        if (
            /bootstrap/i.test(contenidoREADME) ||
            /bootstrap/i.test(metadatos)
        ) {
            tecnologias.add("Bootstrap");
        }
    } catch (error) {
        // Si no hay README accesible, no se atribuye Bootstrap.
    }

    return [...tecnologias].sort((a, b) => {
        const orden = [
            "HTML",
            "CSS",
            "JavaScript",
            "PHP",
            "Bootstrap",
            "Python",
            "Java",
            "MySQL"
        ];

        const posicionA = orden.indexOf(a);
        const posicionB = orden.indexOf(b);

        return (posicionA === -1 ? 99 : posicionA) -
               (posicionB === -1 ? 99 : posicionB) ||
               a.localeCompare(b);
    });
}

function crearEtiquetas(tecnologias) {
    if (!tecnologias.length) {
        return `
            <span class="tech-badge tech-other">
                Tecnologías no disponibles
            </span>
        `;
    }

    return tecnologias.map((tecnologia) => {
        const clase = coloresTecnologias[tecnologia] || "tech-other";

        return `
            <span class="tech-badge ${clase}">
                <span class="tech-dot"></span>
                ${escaparHTML(tecnologia)}
            </span>
        `;
    }).join("");
}

function buscarRepositorio(repositorios, proyecto) {
    const terminos = proyecto.buscar.map(normalizar);

    return repositorios.find((repo) => {
        const nombre = normalizar(repo.name);

        return terminos.some((termino) => {
            return nombre === termino || nombre.includes(termino);
        });
    });
}

function crearTarjeta(repo, proyecto, indice, tecnologias) {
    const descripcion = repo.description
        ? escaparHTML(repo.description)
        : "Proyecto personal. Revisa el repositorio para conocer más.";

    const demo = (repo.homepage || "").trim();
    let enlaceDemo = "";

    try {
        const url = new URL(demo);

        if (url.protocol === "https:" || url.protocol === "http:") {
            enlaceDemo = `
                <a class="text-link"
                   href="${escaparHTML(url.href)}"
                   target="_blank"
                   rel="noopener noreferrer">
                    Ver demo ↗
                </a>
            `;
        }
    } catch {
        enlaceDemo = "";
    }

    const acento = [
        "#50785a",
        "#648eb4",
        "#d27b50",
        "#a28bc4",
        "#b29a36",
        "#438f87",
        "#c16d83",
        "#777bb4"
    ][indice % 8];

    const fondo = [
        "#fffefa",
        "#f5f9fd",
        "#fff8f2",
        "#faf7ff",
        "#fffdf1",
        "#f2faf8",
        "#fff6f8",
        "#f6f5fc"
    ][indice % 8];

    return `
        <article class="project-row"
                 style="--card-accent:${acento};--card-bg:${fondo}">
            <span class="project-number">
                ${String(indice + 1).padStart(2, "0")}
            </span>

            <div class="project-info">
                <h3>${escaparHTML(proyecto.nombre)}</h3>
                <p>${descripcion}</p>

                <div class="project-techs">
                    ${crearEtiquetas(tecnologias)}
                </div>
            </div>

            <div class="project-meta">
                ${enlaceDemo}

                <a class="project-open"
                   href="${escaparHTML(repo.html_url)}"
                   target="_blank"
                   rel="noopener noreferrer"
                   aria-label="Ver código de ${escaparHTML(proyecto.nombre)}">
                    ↗
                </a>
            </div>
        </article>
    `;
}

async function cargarProyectos() {
    listaProyectos.innerHTML = `
        <p class="loading-text">Buscando mis proyectos...</p>
    `;

    try {
        const repositorios = await consultarJSON(
            `https://api.github.com/users/${usuarioGitHub}/repos?type=owner&per_page=100`
        );

        const propios = repositorios.filter(
            (repo) => !repo.fork && !repo.archived
        );

        const encontrados = proyectosDeseados
            .map((proyecto) => ({
                proyecto,
                repo: buscarRepositorio(propios, proyecto)
            }))
            .filter((item) => item.repo);

        if (!encontrados.length) {
            listaProyectos.innerHTML = `
                <p class="empty-text">
                    No encontré esos proyectos en los repositorios públicos.
                    Comprueba los nombres en
                    <a class="text-link"
                       href="https://github.com/${usuarioGitHub}?tab=repositories"
                       target="_blank"
                       rel="noopener noreferrer">tu GitHub ↗</a>.
                </p>
            `;
            return;
        }

        const tarjetas = await Promise.all(
            encontrados.map(async (item) => {
                const tecnologias = await consultarTecnologias(item.repo);

                return {
                    ...item,
                    tecnologias
                };
            })
        );

        listaProyectos.innerHTML = tarjetas.map((item) => {
            const indice = proyectosDeseados.indexOf(item.proyecto);

            return crearTarjeta(
                item.repo,
                item.proyecto,
                indice,
                item.tecnologias
            );
        }).join("");

        const faltantes = proyectosDeseados.filter((proyecto) => {
            return !encontrados.some(
                (item) => item.proyecto === proyecto
            );
        });

        if (faltantes.length) {
            const aviso = document.createElement("p");
            aviso.className = "empty-text";
            aviso.textContent =
                "No se encontraron con esos nombres: " +
                faltantes.map((proyecto) => proyecto.nombre).join(", ") +
                ". Puede que sus repositorios tengan otro nombre.";

            listaProyectos.appendChild(aviso);
        }

    } catch (error) {
        listaProyectos.innerHTML = `
            <p class="empty-text">
                No pude cargar los proyectos. Inténtalo de nuevo o visita
                <a class="text-link"
                   href="https://github.com/${usuarioGitHub}?tab=repositories"
                   target="_blank"
                   rel="noopener noreferrer">GitHub ↗</a>.
            </p>
        `;

        console.error(error);
    }
}

cargarProyectos();
