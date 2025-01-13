import React, { useState, useEffect } from "react";

import Select from "react-select";
import Histogram from "./components/Histogram";

import CryptoJS from "crypto-js";

async function decriptData(password) {
  const response = await fetch("/data.json.enc");
  const data = await response.text();
  const bytes = CryptoJS.AES.decrypt(data, password.toLowerCase());
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  const jsonData = JSON.parse(originalText);
  return jsonData;
}

function decriptQuarters(password, setQuarters, setError) {
  decriptData(password)
    .then((quarters) => setQuarters(quarters))
    .catch(() => setError("Incorrect password"));
}

function getGraph(quarters) {
  const students = new Set();
  for (const quarter in quarters) {
    for (const section in quarters[quarter]) {
      quarters[quarter][section].forEach((student) => {
        students.add(student);
      });
    }
  }

  const studentIndex = {};
  let index = 0;
  [...students].sort().forEach((student) => {
    studentIndex[student] = index++;
  });

  const adj = Array.from({ length: students.size }, () =>
    Array(students.size).fill(0)
  );

  for (const quarter in quarters) {
    for (const section in quarters[quarter]) {
      const studentsInSection = quarters[quarter][section];
      studentsInSection.forEach((student, i) => {
        studentsInSection.slice(i + 1).forEach((otherStudent) => {
          adj[studentIndex[student]][studentIndex[otherStudent]]++;
          adj[studentIndex[otherStudent]][studentIndex[student]]++;
        });
      });
    }
  }

  return { index: studentIndex, adjacencies: adj, nodes: [...students].sort() };
}

function getStudentInfo(quarters) {
  const studentInfo = {};
  for (const [quarter, sections] of Object.entries(quarters)) {
    for (const [section, students] of Object.entries(sections)) {
      for (const student of students) {
        if (!studentInfo[student]) {
          studentInfo[student] = [];
        }
        studentInfo[student].push({ quarter, section });
      }
    }
  }
  return studentInfo;
}

function Section({ weight, classmates, histogramData }) {
  return (
    <div>
      <h3>
        {" "}
        Shared {weight} Sections With {classmates.length} Classmates{" "}
      </h3>
      <div className="section-container">
        <div className="section">
          {classmates.map((classmate) => (
            <p>{classmate}</p>
          ))}
        </div>
        <Histogram
          data={histogramData}
          title={"Comparison to Classmates"}
          xLabel={`Shared ${weight} Sections with X Classmates`}
          yLabel={"# of Classmates"}
        />
      </div>
    </div>
  );
}

function GeneralInfo({ student, studentInfo }) {
  return (
    <div className="general-info">
      <h1>{student}</h1>
      <h2>Section Assignments</h2>
      {studentInfo[student].map(({ quarter, section }) => (
        <p>
          {quarter} - {section}
        </p>
      ))}
    </div>
  );
}

function histogramData(graph) {
  const result = [[], [], [], [], [], []];
  for (const weights of graph.adjacencies) {
    const occurences = [0, 0, 0, 0, 0, 0];
    for (const weight of weights) {
      occurences[weight]++;
    }
    for (let i = 0; i < occurences.length; i++) {
      result[i].push(occurences[i]);
    }
  }
  return result;
}

function AppContent({ quarters }) {
  const [student, setStudent] = useState("(Jesus) Ernesto Larios Murillo");
  const graph = getGraph(quarters);
  const studentInfo = getStudentInfo(quarters);

  const studentIndex = graph.index[student];
  const weights = graph.adjacencies[studentIndex];
  const groups = {};
  weights.forEach((weight, i) => {
    const classmate = graph.nodes[i];
    if (classmate === student) return;
    if (!groups[weight]) groups[weight] = [];
    groups[weight].push(classmate);
  });

  const data = histogramData(graph);
  const sections = Object.keys(groups).sort((a, b) => b - a);
  const options = graph.nodes.map((node) => ({ value: node, label: node }));

  return (
    <div className="App">
      <Select
        options={options}
        onChange={(option) => setStudent(option.value)}
      />
      <GeneralInfo student={student} studentInfo={studentInfo} />
      <h2> Shared Sections</h2>
      {sections.map((section) => {
        return (
          <Section
            weight={section}
            classmates={groups[section]}
            histogramData={data[section]}
          />
        );
      })}
    </div>
  );
}

function App() {
  const [pass, setPass] = useState("");
  const [quarters, setQuarters] = useState(null);
  const [error, setError] = useState(null);

  if (!quarters) {
    return (
      <div>
        <h1>MBA Groups</h1>
        <p>
          Enter password: (hint: the first name of our accounting professor)
        </p>
        <input
          type="text"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        <button onClick={() => decriptQuarters(pass, setQuarters, setError)}>
          Submit
        </button>
        {error && <p>{error}</p>}
      </div>
    );
  }

  return <AppContent quarters={quarters} />;
}

export default App;
