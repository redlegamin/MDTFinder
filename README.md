MDTFinder est un projet archivé, qui servait de platforme de compétition pour les joueurs compétitifs sur le serveur Minecraft "funcraft.net".

Suite à plusieurs demandes, j'ai décidé de rendre le code source public. Cependant, ce code a été créé lors de mes débuts en programmation, et il n'est pas de très bonne qualité. De plus, étant principalement un Bot Discord, et l'API de Discord ayant beaucoup évoluée, ce projet est probablement devenu obsolète et ne fonctionnera pas sans modifications.

Je ne le maintiendrai pas, mais je le laisse ici pour ceux qui souhaitent l'explorer ou s'en inspirer.

Ce projet repose sur un autre composant : 
- [StatsFinder](https://github.com/redlegamin/StatsFinder) : Le service backend de MDTFinder, responsable de la récupérations des données des joueurs sur Funcraft et de la gestion des compétitions.
> A ses débuts, MDTFinder était un simple bot Discord. StatsFinder et les autres composants ont été développés après. Cela explique pourquoi MDTFinder est dépendant de StatsFinder, mais reste un projet distinct. 


A coté de ça, il y a aussi autre projet qui a été développé pour le site :
- [Next-MDTFinder](https://github.com/redlegamin/Next-MDTFinder) : Le site web de MDTFinder, qui permet aux joueurs de consulter les classements et les statistiques des compétitions. (Une instance est disponible sur https://mdtfinder.fr)

- Technlogies utilisées :
    - Node.js
    - Discord.js
    - MongoDB
    - Express.js
    - Mineflayer
    - Next.js
    - etc...