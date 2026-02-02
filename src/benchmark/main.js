import {
  loadCSV,
  drawChart,
  getAllDatasetOptions,
  getCurrentDataset,
  setCurrentDataset,
  runPolylineBenchmark,
  getBenchmarkData,
  getCurrentWebTechnologie,
  setCurrentWebTechnologie,
  setActiveToolHelper,
  getHoverTechHelper,
  setHoverTechHelper,
} from "./lib/spcd3.js";

let data;
let newData;

let studentData =
  "Name,Maths,English,PE,Art,History,IT,Biology,German\nAdrian,95,24,82,49,58,85,21,24\nAmelia,92,98,60,45,82,85,78,92\nBrooke,27,35,84,45,23,50,15,22\nChloe,78,9,83,66,80,63,29,12\nDylan,92,47,91,56,47,81,60,51\nEmily,67,3,98,77,25,100,50,34\nEvan,53,60,97,74,21,78,72,75\nFinn,42,73,65,52,43,61,82,85\nGia,50,81,85,80,43,46,73,91\nGrace,24,95,98,94,89,25,91,69\nHarper,69,9,97,77,56,94,38,2\nHayden,2,72,74,53,40,40,66,64\nIsabella,8,99,84,69,86,20,86,85\nJesse,63,39,93,84,30,71,86,19\nJordan,11,80,87,68,88,20,96,81\nKai,27,65,62,92,81,28,94,84\nKaitlyn,7,70,51,77,79,29,96,73\nLydia,75,49,98,55,68,67,91,87\nMark,51,70,87,40,97,94,60,95\nMonica,62,89,98,90,85,66,84,99\nNicole,70,8,84,64,26,70,12,8\nOswin,96,14,62,35,56,98,5,12\nPeter,98,10,71,41,55,66,38,29\nRenette,96,39,82,43,26,92,20,2\nRobert,78,32,98,55,56,81,46,29\nSasha,87,1,84,70,56,88,49,2\nSylvia,86,12,97,4,19,80,36,8\nThomas,76,47,99,34,48,92,30,38\nVictor,5,60,70,65,97,19,63,83\nZack,19,84,83,42,93,15,98,95";

window.addEventListener("click", (event) => {
  if (!event.target.id.includes("show")) {
    closeElements("options");
  }
  if (!event.target.id.includes("invert")) {
    closeElements("invertOptions");
  }
  if (!event.target.id.includes("move")) {
    closeElements("moveOptions");
  }
  if (!event.target.id.includes("filter")) {
    closeElements("filterOptions");
    if (document.getElementById("filterContainer") != null) {
      document.getElementById("filterContainer").remove();
    }
  }
  if (!event.target.id.includes("range")) {
    closeElements("rangeOptions");
    if (document.getElementById("rangeContainer")) {
      document.getElementById("rangeContainer").remove();
    }
  }
  if (!event.target.id.includes("sel")) {
    closeElements("options_r");
  }
});

document.addEventListener(
  "DOMContentLoaded",
  function () {
    data = studentData;
    newData = loadCSV(data);
    drawChart(newData);
    generateDropDownForHoverTech();
    generateDropDownForWebTech();
    generateDropDownForDataset();
    generateBenchmarkInput();
    document.getElementById("border").style.visibility = "visible";
  },
  false,
);


const dropdown = document.getElementById("tool-dropdown");
const trigger = document.getElementById("tool-trigger");
const triggerIcon = document.getElementById("tool-icon");
const items = dropdown.querySelectorAll(".dropdown-item");

trigger.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdown.classList.toggle("open");
});

items.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.stopPropagation();

    const tool = item.dataset.tool;

    items.forEach((i) => i.classList.remove("selected"));
    item.classList.add("selected");

    const icon = item.querySelector("svg").cloneNode(true);
    triggerIcon.replaceChildren(icon);

    setActiveToolHelper(tool);

    dropdown.classList.remove("open");
  });
});

document.addEventListener("click", () => {
  dropdown.classList.remove("open");
});

function closeElements(id) {
  let options = document.getElementById(id);
  if (!options) return;
  options.style.display = "none";
}

function getDatasetPath(dataset) {
  return `data/dataset_${dataset}.csv`;
}

async function extensiveWebGPUSupportCheck() {
  try {
    if (!("gpu" in navigator)) {
      return false;
    }
    const adapter = await navigator.gpu.requestAdapter();
    return !!adapter;
  } catch (_) {
    return false;
  }
}

export function generateDropDownForDataset() {
  const container = document.getElementById("datasetContainer");
  if (!container) return;

  container.innerHTML = "";

  const label = document.createElement("span");
  label.textContent = "Dataset:";
  label.style.marginRight = "0.5rem";

  const select = document.createElement("select");

  getAllDatasetOptions().forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    if (value === getCurrentDataset()) option.selected = true;
    select.appendChild(option);
  });

  select.addEventListener("change", async (e) => {
    const value = e.target.value;
    setCurrentDataset(value);

    if (value !== "student_dataset") {
      const path = getDatasetPath(value);
      const res = await fetch(path);
      const text = await res.text();
      drawChart(loadCSV(text));
    } else {
      drawChart(loadCSV(data));
    }
  });

  container.appendChild(label);
  container.appendChild(select);
}

export async function generateDropDownForHoverTech() {
  const container = document.getElementById("hoverTechContainer");
  if (!container) return;

  container.innerHTML = "";

  const gpuAvailable = await extensiveWebGPUSupportCheck();

  if (!gpuAvailable && getHoverTechHelper() === "WebGPU") {
    setHoverTechHelper("JS");
  }

  const label = document.createElement("span");
  label.textContent = "Hover:";
  label.style.marginRight = "0.5rem";

  const select = document.createElement("select");

  if (!gpuAvailable) {
    select.disabled = true;
    select.title = "GPU not available - using JS fallback";
  }

  ["WebGPU", "JS"].forEach(function (value) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;

    if (value === "WebGPU" && !gpuAvailable) {
      option.disabled = true;
      option.textContent = "WebGPU (unavailable)";
    }

    if (value === getHoverTechHelper()) option.selected = true;
    select.appendChild(option);
  });

  select.addEventListener("change", async function (e) {
    const value = e.target.value;
    setHoverTechHelper(value);

    const datasetSelect = document.querySelector("#datasetContainer select");

    if (datasetSelect && datasetSelect.value !== "student_dataset") {
      const path = getDatasetPath(datasetSelect.value);
      const res = await fetch(path);
      const text = await res.text();
      drawChart(loadCSV(text));
    } else {
      drawChart(loadCSV(data));
    }
  });

  container.appendChild(label);
  container.appendChild(select);
}

export function generateDropDownForWebTech() {
  const container = document.getElementById("webTechContainer");
  if (!container) return;

  container.innerHTML = "";

  const label = document.createElement("span");
  label.textContent = "Rendering:";
  label.style.marginRight = "0.5rem";

  const select = document.createElement("select");

  const nativeOptions = ["SVG-DOM", "Canvas2D", "WebGL", "WebGPU"];
  const pixiOptions = ["Pixi WebGL", "Pixi WebGPU"];
  const threeOptions = ["Three WebGL", "Three WebGPU"];

  const nativeGroup = document.createElement("optgroup");
  nativeGroup.label = "Native";
  nativeOptions.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    if (value === getCurrentWebTechnologie()) option.selected = true;
    nativeGroup.appendChild(option);
  });
  select.appendChild(nativeGroup);

  // Pixi.js group
  const pixiGroup = document.createElement("optgroup");
  pixiGroup.label = "Pixi.js";
  pixiOptions.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    if (value === getCurrentWebTechnologie()) option.selected = true;
    pixiGroup.appendChild(option);
  });
  select.appendChild(pixiGroup);

  // Three.js group
  const threeGroup = document.createElement("optgroup");
  threeGroup.label = "Three.js";
  threeOptions.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    if (value === getCurrentWebTechnologie()) option.selected = true;
    threeGroup.appendChild(option);
  });
  select.appendChild(threeGroup);

  select.addEventListener("change", async (e) => {
    const value = e.target.value;
    setCurrentWebTechnologie(value);

    const datasetSelect = document.querySelector("#datasetContainer select");

    if (datasetSelect.value !== "student_dataset") {
      const path = getDatasetPath(datasetSelect.value);
      const res = await fetch(path);
      const text = await res.text();
      drawChart(loadCSV(text));
    } else {
      drawChart(loadCSV(data));
    }
  });

  container.appendChild(label);
  container.appendChild(select);
}

export function generateBenchmarkInput() {
  const container = document.getElementById("benchmarkContainer");
  if (!container) return;

  container.innerHTML = "";

  const label = document.createElement("span");
  label.textContent = "Avg. rendering time benchmark:";
  label.style.marginRight = "0.5rem";

  const input = document.createElement("input");
  input.type = "number";
  input.min = "1";
  input.placeholder = "Enter iterations";
  input.style.width = "120px";
  input.style.marginRight = "0.5rem";

  const btn = document.createElement("button");
  btn.textContent = "Start benchmark";
  btn.className = "input-button";

  const currentDisplay = document.createElement("span");
  currentDisplay.style.marginLeft = "1rem";
  currentDisplay.style.color = "#555";
  let benchmarkData = getBenchmarkData();

  btn.addEventListener("click", async () => {
    const avg = await runPolylineBenchmark(parseInt(input.value, 10));

    if (avg == null) {
      alert("Set a valid number of iterations first.");
      return;
    }

    const container = document.getElementById("benchmarkContainer");
    if (!container) return;

    benchmarkData = getBenchmarkData();

    const table = document.querySelector("#pastTestsTable tbody");

    const row = document.createElement("tr");

    const index = table.children.length + 1;

    row.innerHTML = `
    <td>${index}</td>
    <td>${getCurrentWebTechnologie()}</td>
    <td>${getCurrentDataset()}</td>
    <td>${benchmarkData.numOfIterations}</td>
    <td>${avg.toFixed(3)}</td>
  `;

    table.appendChild(row);
  });

  container.appendChild(label);
  container.appendChild(input);
  container.appendChild(btn);
  container.appendChild(currentDisplay);
}