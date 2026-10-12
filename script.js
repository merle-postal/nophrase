

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

    edgesArray = edgesArray.map(edge => {

if (!edge.id) {
edge.id = generateEdgeId(
edge.from,
edge.to
);
}

return edge;
});

/* VIS.JS (vivre vs être) */

const nodes = new vis.DataSet(nodesArray);
const edges = new vis.DataSet(edgesArray);

const container =
document.getElementById("mynetwork");

const data = {
nodes: nodes,
edges: edges
};

/* KONfigurazio GRAfikoa (Aktual) GEOMETRIE D'UNE PENSEE */

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
  gravitationalConstant: -2000,
  centralGravity: 0.15,
  springLength: 350,
  springConstant: 0.04,
  damping: 0.09,
  avoidOverlap: 0,
},

    collision: {
    enabled: true,
    overlap: 0.2, // Tolérance au chevauchement (0 = pas de)
    backfaceCulling: false,

    repulsion: {
      nodeDistance: 100,
      dynamic: true    
    }
  },
    
stabilization: {
  iterations: 200,
  fit: true
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

/* 6. OUTILS */

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

/* IKUsmen HAUtaketa */

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

/* CLIC */

network.on("click", function(params) {

const linkBtn =
document.getElementById(
"rail"
);

if (params.nodes.length > 0) {

const clickedId =
  params.nodes[0];

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

/* 9. ARITHMETIE D'UN FRAGMENT DE PENSEE */

async function rentePermission() {

const textInput =
document.getElementById("newText");

if (
!textInput ||
!textInput.value.trim()
) {

alert( "L'innomable texte est vide." );
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

const éale =
document.getElementById(
"éale"
);

const boldVal =
éale &&
éale.classList.contains("active")
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

    nodes.add(newNode);
    const nodeSaved =
    await saveNodeToSupabase(
    newNode
    );

if (!nodeSaved) {

/* Echec global, conservation locale. */
setStatus(
  "Fragment ajouté localement — " +
  "erreur de connexion Supabase."
);

}

/* Création des liens vers les nœuds sélectionnés. */
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


setStatus("Liéé / Livréé ");
        
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

/* 10. CRÉATION DE LIENS ENTRE ANCIENS NŒUDS */

async function createLinkBetweenSelected() {

if (
selectedNodeIds.length < 2
) {

alert(
  "Livrés par deux " +
  "(avec Ctrl+Clic)" +
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


setStatus("Liéés - Livréés ");
} else { setStatus("Iels sont déjà livréés"); }

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

/* 11. STYLE & GRAISSE */

function toggleBold() {

const btn =
document.getElementById(
"éalee"
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

/* 12. STYLE & ITALIQUE */

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

/* 13. POLICE & STYLE (EXPRESSION, OPPRESSION, REPRESSION) */

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

/* 14. ACHARNER */

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
  "Rien ne contenait ce terme. Contenez ce terme ?" +
    "La phrase est-elle incapable de contenir \n" +
  "le\n" +
    "terme"
);

}
}

/* 15. CACHE LOCAL */

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

/* 16. SUPABASE : CONVERSION NODE -> ROW */

function nodeToRow(node) {

return {
    
id: Number(node.id),
label: node.label || "",
font: node.font || {},
color: node.color || "#ffffff",
border_width: node.borderWidth || 1,
x:
  typeof node.x === "number"
    ? node.x
    : null,
y:
  typeof node.y === "number"
    ? node.y
    : null,
updated_at: new Date().toISOString()
};
}

/* 17. SUPABASE : SAUVEGARDE D'UN NODE */

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

/* 18. SUPABASE : SAUVEGARDE DES LIENS */

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

/* 19. CHARGEMENT INITIAL DE SUPABASE */

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

      if (
        typeof row.x === "number"
      ) { node.x = row.x; }


      if (
        typeof row.y === "number"
      ) {  node.y = row.y;  }
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

  setStatus(
    "Toile Supabase vide — " +
    "données locales conservées."
  );
}

setConnectionStatus(
  "Toile collaborative connectée",
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
/* 20. LOCAL TO GLOBAL */

async function publishLocalData() {

const localNodes =
nodes.get();

const localEdges =
edges.get();

if (
localNodes.length === 0
) {
alert("Aucune donnée locale à publier.");
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

/* 21. REALTIME SUPABASE */

function setupRealtime() {

const channel =
supabaseClient
.channel(
"proxemie-collaboration"
)

  /* ---------------- INSERT ---------------- */

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


  /* ---------------- UPDATE ---------------- */

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


  /* ---------------- DELETE ---------------- */

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


  /* ---------------- E. INSERT ---------------- */

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


  /* ---------------- E. UPDATE ---------------- */

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


  /* ---------------- E.E DELETE ---------------- */

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

/* 22. AQBON */

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
    
    if (nodes.get(node.id)) {
nodes.update(node);
} else {
nodes.add(node);
}

applyingRemoteChange = false;

saveLocalData();
}

/* 23. SUPPRESS */

function applyRemoteNodeDelete(row) {

if (!row) return;
applyingRemoteChange = true;
nodes.remove(
Number(row.id)
);

applyingRemoteChange = false;
saveLocalData();
}

/* 24. LIVRAISON DISTANTE / DOMICILES */

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

/* 25. SUPPRESS BIS */

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
/* 26. PLACES sauvegardées */

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

/* 27. DOMICILE MOBILE */

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

/* 28. ENTREE (si tel est ton désir ?) */

(async function init() {
saveLocalData();
    setupRealtime();
    await loadFromSupabase();

})();
