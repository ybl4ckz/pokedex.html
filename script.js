const form = document.querySelector("#form-busca");
const campo = document.querySelector("#campo-nome");
const resultado = document.querySelector("#resultado");
const btnAleatorio = document.querySelector("#btn-aleatorio");
const CORES_TIPO = {
  normal: "#9a9a8a", fire: "#e8602c", water: "#3d85d8", electric: "#e6b800",
  grass: "#4caf50", ice: "#5cc7d6", fighting: "#b5412f", poison: "#9b4fa5",
  ground: "#c9a24a", flying: "#7b93e0", psychic: "#e0527f", bug: "#8bb12a",
  rock: "#a89a5c", ghost: "#6a5a9e", dragon: "#5a3fc7", dark: "#5b4a42",
  steel: "#8a9bb0", fairy: "#e48bc0"
};

const NOMES_STATS = {
  hp: "HP", attack: "Ataque", defense: "Defesa",
  "special-attack": "Ataque esp.", "special-defense": "Defesa esp.", speed: "Velocidade"
};

async function buscarPokemon(nome) {
  const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nome}`);
  if (!resposta.ok) {
    throw new Error("Pokémon não encontrado");
  }
  return resposta.json();
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function mostrarMensagem(texto, ehErro = false) {
  resultado.innerHTML = `<p class="mensagem ${ehErro ? "erro" : ""}">${texto}</p>`;
}
function mostrarCarta(pokemon) {
  const nome = capitalizar(pokemon.name);
  const imagem = pokemon.sprites.other["official-artwork"].front_default;
  const altura = pokemon.height / 10;
  const peso = pokemon.weight / 10;
 
  const tiposHTML = pokemon.types.map(t => {
    const cor = CORES_TIPO[t.type.name] || "#777";
    return `<span class="badge" style="--cor-do-badge:${cor}">${capitalizar(t.type.name)}</span>`;
  }).join("");

  const statsHTML = pokemon.stats
    .filter(s => NOMES_STATS[s.stat.name])
    .map(s => `
      <div class="stat">
        <span>${NOMES_STATS[s.stat.name]}</span>
        <div class="barra"><div style="width:${(s.base_stat / 255) * 100}%"></div></div>
        <strong>${s.base_stat}</strong>
      </div>`)
    .join("");

  const corPrincipal = CORES_TIPO[pokemon.types[0].type.name] || "#777";

  resultado.innerHTML = `
    <article class="carta" style="--cor-tipo:${corPrincipal}">
      <h2>#${pokemon.id} ${nome}</h2>
      <img id="img-pokemon" src="${imagem}" alt="Imagem de ${nome}">
      <button type="button" id="btn-shiny" class="btn-shiny" aria-pressed="false">✨ Ver shiny</button>
      <div class="tipos">${tiposHTML}</div>
      <div class="medidas">
        <p>Altura<strong>${altura.toFixed(1)} m</strong></p>
        <p>Peso<strong>${peso.toFixed(1)} kg</strong></p>
      </div>
      ${statsHTML}
    </article>`;
 
  ativarModoShiny(pokemon);
}

function ativarModoShiny(pokemon) {
  const arte = pokemon.sprites.other["official-artwork"];
  const botao = document.querySelector("#btn-shiny");
  const imagem = document.querySelector("#img-pokemon");

  if (!arte.front_shiny) {
    botao.hidden = true;
    return;
  }
 
  let ehShiny = false;
  botao.addEventListener("click", () => {
    ehShiny = !ehShiny; 
    imagem.src = ehShiny ? arte.front_shiny : arte.front_default;
    botao.textContent = ehShiny ? "Ver normal" : "✨ Ver shiny";
    botao.setAttribute("aria-pressed", ehShiny);
    botao.classList.toggle("ativo", ehShiny);
  });
}

async function pesquisar(termo) {
  mostrarMensagem("Carregando...");
  try {
    const pokemon = await buscarPokemon(termo);
    mostrarCarta(pokemon);
  } catch (erro) {

    if (erro.message === "Pokémon não encontrado") {
      mostrarMensagem(`Não encontramos "${termo}". Confira o nome e tente de novo.`, true);
    } else {
      mostrarMensagem("Falha de conexão. Verifique sua internet e tente de novo.", true);
    }
  }
  campo.focus();
}
 

form.addEventListener("submit", event => {
  event.preventDefault();
  const termo = campo.value.trim().toLowerCase();
 
  if (termo === "") { 
    mostrarMensagem("Digite o nome de um Pokémon para buscar.", true);
    campo.focus();
    return;
  }
  pesquisar(termo);
});

btnAleatorio.addEventListener("click", () => {
  const numero = Math.floor(Math.random() * 1025) + 1;
  campo.value = numero;
  pesquisar(numero);
});
