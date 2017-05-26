| **Name** | **Html5DiagramHighlight** | **Version** | 
| --- | --- | --- |
| **Updated by** | Mathias PFAUWADEL | 1.0 |


## Patch Notes

* 1.0 : 1st version working

## TBD

* More Options

## Description 
Allow you to hightlight object on diagram depending on their category or association region. Once installed, this will apply to all diagram of your evolve site.

## Screen Shot
Here we want to highlight only the Process with the category Task

<img src="https://raw.githubusercontent.com/nevakee716/cwHtml5DiagramHighlight/master/screen/1.jpg" alt="Drawing" style="width: 95%;"/>

## Highlight Algorithm

IF a shape is selected by the different filter it will be highlight.
If a joiner is between to highlight shape it will highlight
If a connector is connected to at least 1 highlight shape in each direction, it will highlight


## Evolve Configuration
This is a specific so no layout to configure on Evolve

## Options
<img src="https://raw.githubusercontent.com/nevakee716/cwHtml5DiagramHighlight/master/screen/2.jpg" alt="Drawing" style="width: 95%;"/>

### Opacity (0 to 1) : 
You can change the opacity of the non selected object with the value of this.globalAlpha

### ConnectorSet:

List the object that you want to be considered as connector set with the value of this.connectorObject

### highlightColour:

Choose the highlight colour with the value of this.highlightColour


## Cohabitation with other specific

Here is a list of all the specific and the function they modified. If you have other personnal specific that use the same function, you will need to merge them in to the main.js
https://docs.google.com/spreadsheets/d/19Mi3LsdQlRuTGFAZiGtLFPGcLhrScWZFTSsm-qQ_BiY/edit#gid=0




