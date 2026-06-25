# Federal Employment Tracking Tool (FETT) // Outil de suivi de l’emploi dans la fonction publique fédérale (OSEFPF)

## Description

### English

This tool provides an overview of the Canadian public service workforce trends.

### Français

Cet outil fournit un aperçu des tendances de la main-d'œuvre de la fonction publique canadienne.

## Input from XLSX file // Entrée à partir d'un fichier XLSX

### English

A sample input file named `input-sample.xlsx` is provided in the repository. You can modify this file or create a new one based on the same structure.

This file contains multiple sheets, each representing different datasets related to the public service workforce. The input xlsx file can be used to prime the data displayed in the tool. The input sample file was created in a way that mimics as much as possible the format this data is provided to us by the GoC.

### Français

Un fichier d'entrée d'exemple nommé `input-sample.xlsx` est fourni dans le dépôt. Vous pouvez modifier ce fichier ou en créer un nouveau basé sur la même structure.

Ce fichier contient plusieurs feuilles, chacune représentant différents ensembles de données liés à la main-d'œuvre de la fonction publique. Le fichier xlsx d'entrée peut être utilisé pour amorcer les données affichées dans l'outil. Le fichier d'exemple d'entrée a été créé de manière à imiter autant que possible le format dans lequel ces données nous sont fournies par le gouvernement du Canada.

## Project setup // Mise en route

```
npm install
```

## Compilation // Compilation

### Overwrite JSON payload with new Excel file // Remplacer la charge utile JSON par un nouveau fichier Excel

```
node build.js <input-file.xlsx>
```

### Compiles and hot-reloads for development // Compilations et recharges à chaud pour le développement

```
npm run dev
```

### Compiles and minifies for production // Compilation et miniaturisation pour la production

```
npm run build
```

## Interfaces // Interfaces

### English

Insert this web component using the `<pbotool-federal-employment-tracking-tool></pbotool-federal-employment-tracking-tool>` tag. An example of how the component is loaded is available in `index.html`.

### Français

Insérez ce composant web en utilisant la balise `<pbotool-federal-employment-tracking-tool></pbotool-federal-employment-tracking-tool>`. Un exemple de la façon dont le composant est chargé est disponible dans `index.html`.
