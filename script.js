

const SUPABASE_URL = "https://tmkrexnkjponydrqkegn.supabase.co";
const SUPABASE_KEY = "sb_publishable_5VPFqTaFz7rMDVrVlWdRTA_VDocTCj6";

const supabaseClient = window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

let selectedNodeIds = [];
let currentFontFace = "Arial";
let applyingRemoteChange = false;

const savedNodes =
localStorage.getItem("proxemieNodes");

const savedEdges =
localStorage.getItem("proxemieEdges");

let nodesArray = savedNodes
? JSON.parse(savedNodes)
: [
{
id: 1,
label: "Fragment initial",
font: {
size: 16,
face: "Arial"
},
color: "#dddddd"
}
];

let edgesArray = savedEdges
? JSON.parse(savedEdges)
: [];

/* Les anciennes liaisons Vis.js n'ont éventuellement pas d'identifiant. On leur en donne un. */
    edgesArray = edgesArray.map(edge => {

if (!edge.id) {
edge.id = generateEdgeId(
edge.from,
edge.to
);
}

return edge;
});

/* ============================================================
4. DATASETS VIS.JS
============================================================ */

const nodes = new vis.DataSet(nodesArray);
const edges = new vis.DataSet(edgesArray);

const container =
document.getElementById("mynetwork");

const data = {
nodes: nodes,
edges: edges
};

/* ============================================================
5. CONFIGURATION VIS.JS
============================================================ */

const options = {

nodes: {
shape: "box",
margin: 10,

font: {
  multi: "html",
  color: "#000000"
},

borderWidth: 1,
shadow: true,
    scaling: {
    min: 10,
    max: 20
  }
},

edges: {
width: 1,

color: {
  color: "#848484",
  highlight: "#000000"
},

smooth: {
  type: "continuous"
}

},

physics: {
enabled: true,

barnesHut: {
  gravitationalConstant: -2400,
  centralGravity: 0.2,
  springLength: 300,
  springConstant: 0.04,
  damping: 0.09,
  avoidOverlap: 0,
},

stabilization: {
  iterations: 150
}

},

interaction: {
hover: true,
selectConnectedEdges: false,
dragNodes: true
}
};

const network = new vis.Network(
container,
data,
options
);

/* ============================================================
6. OUTILS
============================================================ */

function setStatus(message) {

const status =
document.getElementById("status");

if (status) {
status.innerText = message;
}
}

function setConnectionStatus(
message,
type = ""
) {

const ende =
document.getElementById("connectionStatus");

if (!ende) return;
ende.innerText = message;
ende.className = type;
}

/*

    Identifiant stable pour une liaison.

    On trie les deux extrémités pour considérer :

    A -> B

    B -> A

    comme la même liaison.
    */
    function generateEdgeId(a, b) {

const first = String(a);
const second = String(b);

const ordered =
[first, second].sort();

return "edge-" +
ordered[0] +
"-" +
ordered[1];
}

/* ============================================================
7. SÉLECTION VISUELLE
============================================================ */

function updateVisualSelection() {

const allNodes =
nodes.get();

const updates = [];

allNodes.forEach(node => {

if (
  selectedNodeIds.includes(node.id)
) {

  updates.push({
    id: node.id,

    color: "#ff9999",

    borderWidth: 4,

    font: {
      color: "#000000"
    }
  });

} else {

  updates.push({
    id: node.id,

    color: "#ffffff",

    borderWidth: 1,

    font: {
      color: "#333333"
    }
  });

}

});

if (updates.length > 0) {
nodes.update(updates);
}
}

/* ============================================================
8. CLIC SUR LA TOILE
============================================================ */

network.on("click", function(params) {

const linkBtn =
document.getElementById(
"rail"
);

if (params.nodes.length > 0) {

const clickedId =
  params.nodes[0];


/*
 * On utilise l'événement original du clic.
 */
const originalEvent =
  params.event &&
  params.event.srcEvent;


const multiSelect =
  originalEvent &&
  (
    originalEvent.ctrlKey ||
    originalEvent.metaKey
  );


if (multiSelect) {

  const index =
    selectedNodeIds.indexOf(clickedId);


  if (index > -1) {

    selectedNodeIds.splice(
      index,
      1
    );

  } else {

    selectedNodeIds.push(
      clickedId
    );
  }

} else {

  selectedNodeIds = [
    clickedId
  ];
}


updateVisualSelection();


if (selectedNodeIds.length > 0) {

  setStatus(
    selectedNodeIds.length +
    " nœud(s) sélectionné(s). " +
    "Ctrl+Clic pour en ajouter."
  );


  if (linkBtn) {

    linkBtn.style.display =
      selectedNodeIds.length >= 2
        ? "inline-block"
        : "none";
  }

} else {

  setStatus(
    "Aucun lien spécifique."
  );

  if (linkBtn) {
    linkBtn.style.display = "none";
  }
}

} else {

selectedNodeIds = [];

updateVisualSelection();

setStatus(
  "Sélection effacée."
);

if (linkBtn) {
  linkBtn.style.display = "none";
}

}

});

/* ============================================================
9. AJOUT D'UN NŒUD
============================================================ */

async function rentePermission() {

const textInput =
document.getElementById("newText");

if (
!textInput ||
!textInput.value.trim()
) {

alert(
  "Le texte ne peut pas être vide."
);

return;

}

const textValue =
textInput.value;

const fontSelect =
document.getElementById("fontFace");

const selectedFont =
fontSelect
? fontSelect.value
: "Arial";

const éal =
document.getElementById(
"éal"
);

const boldVal =
éal &&
éal.classList.contains("active")
? "bold "
: "";

const entique =
document.getElementById(
"entique"
);

const italicVal =
entique &&
entique.classList.contains("active")
? "italic "
: "";

/*

    Timestamp suffisamment unique pour cette installation.
    */
    const newId =
    Date.now();

const newNode = {

id: newId,

label: textValue,

font: {

  face: selectedFont,

  size: 14,

  style:
    italicVal +
    boldVal,

  color: "#000000"
},

color: "#ffffff",

borderWidth: 1

};

/*

    Ajout immédiat dans Vis.js.
    */
    nodes.add(newNode);

/*

    Sauvegarde Supabase.
    */
    const nodeSaved =
    await saveNodeToSupabase(
    newNode
    );

if (!nodeSaved) {

/*
 * Si Supabase échoue, le nœud reste
 * quand même dans le cache local.
 */
setStatus(
  "Fragment ajouté localement — " +
  "erreur de connexion Supabase."
);

}

/*

    Création des liens vers les nœuds sélectionnés.
    */
    if (
    selectedNodeIds.length > 0
    ) {

const newEdges = [];


selectedNodeIds.forEach(
  targetId => {

    const edge = {

      id: generateEdgeId(
        targetId,
        newId
      ),

      from: targetId,

      to: newId
    };


    /*
     * Éviter les doublons.
     */
    const exists =
      edges.get(
        edge.id
      );


    if (!exists) {
      newEdges.push(edge);
    }

  }
);


if (newEdges.length > 0) {

  edges.add(newEdges);

  await saveEdgesToSupabase(
    newEdges
  );
}


setStatus(
  "Fragment ajouté et lié à " +
  selectedNodeIds.length +
  " autre(s)."
);


selectedNodeIds = [];

updateVisualSelection();


const linkBtn =
  document.getElementById(
    "rail"
  );


if (linkBtn) {
  linkBtn.style.display = "none";
}

} else {

setStatus(
  "Fragment ajouté (sans lien)."
);

}

textInput.value = "";

saveLocalData();
}

/* ============================================================
10. CRÉATION DE LIENS ENTRE ANCIENS NŒUDS
============================================================ */

async function createLinkBetweenSelected() {

if (
selectedNodeIds.length < 2
) {

alert(
  "Sélectionnez au moins 2 nœuds " +
  "(avec Ctrl+Clic) pour créer " +
  "un lien entre eux."
);

return;

}

const newEdges = [];

const sourceId =
selectedNodeIds[0];

for (
let i = 1;
i < selectedNodeIds.length;
i++
) {

const targetId =
  selectedNodeIds[i];


const edgeId =
  generateEdgeId(
    sourceId,
    targetId
  );


const exists =
  edges.get(edgeId);


if (!exists) {

  newEdges.push({

    id: edgeId,

    from: sourceId,

    to: targetId
  });

}

}

if (newEdges.length > 0) {

edges.add(newEdges);

await saveEdgesToSupabase(
  newEdges
);


setStatus(
  "Liens créés entre les " +
  selectedNodeIds.length +
  " nœuds."
);

} else {

setStatus(
  "Ces nœuds sont déjà tous reliés."
);

}

selectedNodeIds = [];

updateVisualSelection();

const linkBtn =
document.getElementById(
"rail"
);

if (linkBtn) {
linkBtn.style.display = "none";
}

saveLocalData();
}

/* ============================================================
11. STYLE : GRAS
============================================================ */

function toggleBold() {

const btn =
document.getElementById(
"éale"
);

if (!btn) return;

btn.classList.toggle(
"active"
);

btn.style.fontWeight =
btn.classList.contains("active")
? "bold"
: "normal";

btn.style.backgroundColor =
btn.classList.contains("active")
? "#333"
: "#eee";

btn.style.color =
btn.classList.contains("active")
? "#fff"
: "#000";
}

/* ============================================================
12. STYLE : ITALIQUE
============================================================ */

function toggleItalic() {

const btn =
document.getElementById(
"entique"
);

if (!btn) return;

btn.classList.toggle(
"active"
);

btn.style.fontStyle =
btn.classList.contains("active")
? "italic"
: "normal";

btn.style.backgroundColor =
btn.classList.contains("active")
? "#333"
: "#eee";

btn.style.color =
btn.classList.contains("active")
? "#fff"
: "#000";
}

/* ============================================================
13. CHOIX DE LA POLICE
============================================================ */

function setFont(face) {

currentFontFace = face;

const select =
document.getElementById(
"fontFace"
);

if (select) {
select.value = face;
}
}

/* ============================================================
14. RECHERCHE
============================================================ */

function searchInWeb() {

const searchInput =
document.getElementById(
"searchInput"
);

if (
!searchInput ||
!searchInput.value
) {
return;
}

const term =
searchInput.value.toLowerCase();

const allNodes =
nodes.get();

const foundIds = [];

allNodes.forEach(node => {

if (
  node.label &&
  node.label
    .toLowerCase()
    .includes(term)
) {

  foundIds.push(
    node.id
  );
}

});

if (foundIds.length > 0) {

network.focus(
  foundIds[0],
  {
    scale: 1.5,
    animation: true
  }
);


nodes.update(
  foundIds.map(id => ({
    id: id,
    color: "#ffff99"
  }))
);


setStatus(
  foundIds.length +
  " fragment(s) trouvé(s)."
);


setTimeout(() => {

  nodes.update(
    foundIds.map(id => ({
      id: id,
      color: "#ffffff"
    }))
  );

}, 2000);

} else {

setStatus(
  "Aucun fragment ne contient ce terme."
);

}
}

/* ============================================================
15. CACHE LOCAL
============================================================ */

function saveLocalData() {

localStorage.setItem(
"proxemieNodes",
JSON.stringify(
nodes.get()
)
);

localStorage.setItem(
"proxemieEdges",
JSON.stringify(
edges.get()
)
);
}


    function saveData() {
    saveLocalData();
    }

    nodes.on("*", () => {

if (!applyingRemoteChange) {
saveLocalData();
}

});

edges.on("*", () => {

if (!applyingRemoteChange) {
saveLocalData();
}

});

/* ============================================================
16. SUPABASE : CONVERSION NODE -> ROW
============================================================ */

function nodeToRow(node) {

return {

id: Number(node.id),

label:
  node.label || "",

font:
  node.font || {},

color:
  node.color || "#ffffff",

border_width:
  node.borderWidth || 1,

x:
  typeof node.x === "number"
    ? node.x
    : null,

y:
  typeof node.y === "number"
    ? node.y
    : null,

updated_at:
  new Date().toISOString()

};
}

/* ============================================================
17. SUPABASE : SAUVEGARDE D'UN NODE
============================================================ */

async function saveNodeToSupabase(node) {

try {

const row =
  nodeToRow(node);


const {
  error
} = await supabaseClient
  .from("proxemie_nodes")
  .upsert(
    row,
    {
      onConflict: "id"
    }
  );


if (error) {

  console.error(
    "Erreur Supabase node :",
    error
  );

  return false;
}


return true;

} catch (error) {

console.error(
  "Erreur Supabase :",
  error
);

return false;

}
}

/* ============================================================
18. SUPABASE : SAUVEGARDE DES LIENS
============================================================ */

async function saveEdgesToSupabase(
edgeList
) {

if (!edgeList.length) {
return true;
}

try {

const rows =
  edgeList.map(edge => ({

    id:
      edge.id ||
      generateEdgeId(
        edge.from,
        edge.to
      ),

    source_id:
      Number(edge.from),

    target_id:
      Number(edge.to)
  }));


const {
  error
} = await supabaseClient
  .from("proxemie_edges")
  .upsert(
    rows,
    {
      onConflict: "id"
    }
  );


if (error) {

  console.error(
    "Erreur Supabase edges :",
    error
  );

  return false;
}


return true;

} catch (error) {

console.error(
  "Erreur Supabase edges :",
  error
);

return false;

}
}

/* ============================================================
19. CHARGEMENT INITIAL DE SUPABASE
============================================================ */

async function loadFromSupabase() {

setConnectionStatus(
"Connexion à Supabase...",
""
);

try {

const [
  nodesResponse,
  edgesResponse
] = await Promise.all([

  supabaseClient
    .from("proxemie_nodes")
    .select("*")
    .order(
      "created_at",
      {
        ascending: true
      }
    ),

  supabaseClient
    .from("proxemie_edges")
    .select("*")
]);


if (nodesResponse.error) {
  throw nodesResponse.error;
}


if (edgesResponse.error) {
  throw edgesResponse.error;
}


const remoteNodes =
  nodesResponse.data || [];


const remoteEdges =
  edgesResponse.data || [];


/*
 * Supabase devient la source principale.
 */
if (remoteNodes.length > 0) {

  applyingRemoteChange = true;


  nodes.clear();


  const visNodes =
    remoteNodes.map(row => {

      const node = {

        id: Number(row.id),

        label:
          row.label,

        font:
          row.font || {
            size: 14,
            face: "Arial"
          },

        color:
          row.color || "#ffffff",

        borderWidth:
          row.border_width || 1
      };


      /*
       * Restaurer les coordonnées si elles existent.
       */
      if (
        typeof row.x === "number"
      ) {
        node.x = row.x;
      }


      if (
        typeof row.y === "number"
      ) {
        node.y = row.y;
      }


      return node;
    });


  nodes.add(visNodes);


  edges.clear();


  edges.add(
    remoteEdges.map(row => ({

      id:
        row.id ||
        generateEdgeId(
          row.source_id,
          row.target_id
        ),

      from:
        Number(row.source_id),

      to:
        Number(row.target_id)
    }))
  );


  applyingRemoteChange = false;


  saveLocalData();


  setStatus(
    remoteNodes.length +
    " fragment(s) chargés depuis la toile."
  );


} else {

  /*
   * La base est vide.
   *
   * On conserve les données locales existantes.
   * Elles pourront être publiées avec
   * publishLocalData().
   */
  setStatus(
    "Toile Supabase vide — " +
    "données locales conservées."
  );
}


setConnectionStatus(
  "● Toile collaborative connectée",
  "online"
);

} catch (error) {

console.error(
  "Impossible de charger Supabase :",
  error
);


setConnectionStatus(
  "● Supabase indisponible — mode local",
  "error"
);


setStatus(
  "Connexion distante indisponible."
);

}
}
/* ============================================================
20. PUBLICATION DES DONNÉES LOCALES

Utile si votre ancienne toile contient déjà
des données dans localStorage.

Elle permet de les envoyer une fois vers Supabase.
============================================================ */

async function publishLocalData() {

const localNodes =
nodes.get();

const localEdges =
edges.get();

if (
localNodes.length === 0
) {

alert(
  "Aucune donnée locale à publier."
);

return;

}

setStatus(
"Publication de la toile locale..."
);

/*

    Nodes
    */
    for (
    const node of localNodes
    ) {

await saveNodeToSupabase(
  node
);

}

/*

    Edges
    */
    await saveEdgesToSupabase(
    localEdges
    );

setStatus(
"Toile locale publiée sur Supabase."
);
}

/* ============================================================
21. REALTIME SUPABASE
============================================================ */

function setupRealtime() {

const channel =
supabaseClient
.channel(
"proxemie-collaboration"
)

  /* ---------------- NODE INSERT ---------------- */

  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "proxemie_nodes"
    },

    payload => {

      applyRemoteNode(
        payload.new
      );
    }
  )


  /* ---------------- NODE UPDATE ---------------- */

  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "proxemie_nodes"
    },

    payload => {

      applyRemoteNode(
        payload.new
      );
    }
  )


  /* ---------------- NODE DELETE ---------------- */

  .on(
    "postgres_changes",
    {
      event: "DELETE",
      schema: "public",
      table: "proxemie_nodes"
    },

    payload => {

      applyRemoteNodeDelete(
        payload.old
      );
    }
  )


  /* ---------------- EDGE INSERT ---------------- */

  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "proxemie_edges"
    },

    payload => {

      applyRemoteEdge(
        payload.new
      );
    }
  )


  /* ---------------- EDGE UPDATE ---------------- */

  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "proxemie_edges"
    },

    payload => {

      applyRemoteEdge(
        payload.new
      );
    }
  )


  /* ---------------- EDGE DELETE ---------------- */

  .on(
    "postgres_changes",
    {
      event: "DELETE",
      schema: "public",
      table: "proxemie_edges"
    },

    payload => {

      applyRemoteEdgeDelete(
        payload.old
      );
    }
  )


  .subscribe(
    (status, error) => {

      console.log(
        "Realtime :",
        status
      );


      if (error) {

        console.error(
          "Realtime error :",
          error
        );
      }
    }
  );

return channel;
}

/* ============================================================
22. APPLIQUER UN NODE DISTANT
============================================================ */

function applyRemoteNode(row) {

if (!row) return;

const node = {

id:
  Number(row.id),

label:
  row.label,

font:
  row.font || {
    size: 14,
    face: "Arial"
  },

color:
  row.color || "#ffffff",

borderWidth:
  row.border_width || 1

};

if (
typeof row.x === "number"
) {
node.x = row.x;
}

if (
typeof row.y === "number"
) {
node.y = row.y;
}

applyingRemoteChange = true;

/*

    Si le nœud existe, update.

    Sinon, add.
    */
    if (nodes.get(node.id)) {

nodes.update(node);

} else {

nodes.add(node);

}

applyingRemoteChange = false;

saveLocalData();
}

/* ============================================================
23. SUPPRESSION D'UN NODE DISTANT
============================================================ */

function applyRemoteNodeDelete(row) {

if (!row) return;

applyingRemoteChange = true;

nodes.remove(
Number(row.id)
);

applyingRemoteChange = false;

saveLocalData();
}

/* ============================================================
24. APPLIQUER UNE LIAISON DISTANTE
============================================================ */

function applyRemoteEdge(row) {

if (!row) return;

const edge = {

id:
  row.id ||
  generateEdgeId(
    row.source_id,
    row.target_id
  ),

from:
  Number(row.source_id),

to:
  Number(row.target_id)

};

applyingRemoteChange = true;

if (edges.get(edge.id)) {

edges.update(edge);

} else {

/*
 * Ne créer la liaison que si les deux
 * nœuds existent déjà.
 */
if (
  nodes.get(edge.from) &&
  nodes.get(edge.to)
) {

  edges.add(edge);
}

}

applyingRemoteChange = false;

saveLocalData();
}

/* ============================================================
25. SUPPRESSION D'UNE LIAISON DISTANTE
============================================================ */

function applyRemoteEdgeDelete(row) {

if (!row) return;

applyingRemoteChange = true;

if (row.id) {

edges.remove(row.id);

} else {

edges.remove(
  generateEdgeId(
    row.source_id,
    row.target_id
  )
);

}

applyingRemoteChange = false;

saveLocalData();
}
/* ============================================================
26. SAUVEGARDE DES POSITIONS

Quand quelqu'un déplace un nœud, sa position x/y est
enregistrée dans Supabase.

Cela permet de conserver aussi la composition graphique.
============================================================ */

network.on(
"dragEnd",
async function(params) {

if (
  !params.nodes ||
  params.nodes.length === 0
) {
  return;
}


const movedNodes =
  nodes.get(
    params.nodes
  );


for (
  const node of movedNodes
) {

  const position =
    network.getPosition(
      node.id
    );


  const update = {

    id:
      Number(node.id),

    label:
      node.label,

    font:
      node.font || {},

    color:
      node.color || "#ffffff",

    border_width:
      node.borderWidth || 1,

    x:
      position.x,

    y:
      position.y,

    updated_at:
      new Date().toISOString()
  };


  try {

    await supabaseClient
      .from("proxemie_nodes")
      .upsert(
        update,
        {
          onConflict: "id"
        }
      );

  } catch (error) {

    console.error(
      "Erreur position :",
      error
    );
  }
}


saveLocalData();

}
);

/* ============================================================
27. DÉPLACEMENT DE L'INTERFACE
============================================================ */

const uiLayer =
document.getElementById(
"ui-layer"
);

if (uiLayer) {

let isDragging = false;

let startX;
let startY;

let initialLeft;
let initialTop;

uiLayer.addEventListener(
"mousedown",
(e) => {

  const tag =
    e.target.tagName;


  if (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "BUTTON" ||
    tag === "SELECT" ||
    tag === "OPTION"
  ) {

    return;
  }


  isDragging = true;


  startX =
    e.clientX;

  startY =
    e.clientY;


  const rect =
    uiLayer.getBoundingClientRect();


  initialLeft =
    rect.left;

  initialTop =
    rect.top;


  uiLayer.style.cursor =
    "move";
}

);

document.addEventListener(
"mousemove",
(e) => {

  if (!isDragging) return;


  const dx =
    e.clientX - startX;


  const dy =
    e.clientY - startY;


  uiLayer.style.left =
    (initialLeft + dx) + "px";


  uiLayer.style.top =
    (initialTop + dy) + "px";


  uiLayer.style.right =
    "auto";


  uiLayer.style.bottom =
    "auto";
}

);

document.addEventListener(
"mouseup",
() => {

  isDragging = false;


  if (uiLayer) {

    uiLayer.style.cursor =
      "grab";
  }
}

);
}

/* ============================================================
28. ENTREE
============================================================ */

(async function init() {
saveLocalData();
    setupRealtime();
    await loadFromSupabase();

})();
