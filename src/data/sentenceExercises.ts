export interface SentenceExercise {
  de: string;
  en: string;
  wordsUsed: string[];
}

export const SENTENCE_EXERCISES: Record<string, SentenceExercise[]> = {
  "Daily Life & Home": [
    {
      de: "Ich muss heute den Abfall rausbringen und die Küche putzen.",
      en: "I have to take out the waste and clean the kitchen today.",
      wordsUsed: ["Abfall", "putzen"]
    },
    {
      de: "Der Mieter hat die Wohnung sehr gemütlich eingerichtet.",
      en: "The tenant furnished the apartment very cozily.",
      wordsUsed: ["Mieter", "Wohnung", "gemütlich", "einrichten"]
    },
    {
      de: "Kannst du mich bitte später vom Bahnhof abholen?",
      en: "Can you please pick me up from the station later?",
      wordsUsed: ["abholen"]
    },
    {
      de: "Der Hausmeister repariert heute den Aufzug im Wohnsitz.",
      en: "The caretaker is repairing the elevator in the residence today.",
      wordsUsed: ["Hausmeister", "Wohnsitz"]
    },
    {
      de: "Es ist wichtig, im Haushalt eine gewisse Ordnung zu halten.",
      en: "It is important to keep a certain order in the household.",
      wordsUsed: ["Haushalt", "Ordnung"]
    },
    {
      de: "Wir möchten ein warmes Zuhause einrichten und Möbel kaufen.",
      en: "We want to set up a warm home and buy furniture.",
      wordsUsed: ["Zuhause", "einrichten", "Möbel"]
    },
    {
      de: "Ich reinige am Samstag den Backofen und wische den gesamten Boden.",
      en: "I clean the oven on Saturday and wipe the entire floor.",
      wordsUsed: ["reinigen", "Boden"]
    },
    {
      de: "Der Kühlschrank steht in der Ecke und hält alle Lebensmittel frisch.",
      en: "The refrigerator stands in the corner and keeps all food fresh.",
      wordsUsed: ["Kühlschrank", "frisch"]
    },
    {
      de: "Hast du schon die Wäsche gewaschen und auf den Balkon gehängt?",
      en: "Have you already washed the laundry and hung it on the balcony?",
      wordsUsed: ["Wäsche", "Balkon"]
    }
  ],
  "Work & Education": [
    {
      de: "Mein Kollege hat sich für eine neue Arbeitsstelle beworben.",
      en: "My colleague applied for a new job position.",
      wordsUsed: ["Kollege", "Arbeitsstelle"]
    },
    {
      de: "Der Chef bietet dem neuen Praktikanten eine feste Stelle an.",
      en: "The boss offers the new intern a permanent position.",
      wordsUsed: ["Chef", "Praktikant", "anbieten"]
    },
    {
      de: "Während des Studiums muss man fleißig studieren und lernen.",
      en: "During the studies one has to study diligently and learn.",
      wordsUsed: ["studieren"]
    },
    {
      de: "Sie möchte nach der Ausbildung endlich gutes Geld verdienen.",
      en: "She wants to finally earn good money after the training.",
      wordsUsed: ["Ausbildung", "verdienen"]
    },
    {
      de: "Der Betriebsrat hilft den Mitarbeitern bei schweren Fragen.",
      en: "The works council helps the employees with difficult questions.",
      wordsUsed: ["Betriebsrat", "Mitarbeiter"]
    },
    {
      de: "Das Praktikum in dieser großen Branche war sehr nützlich.",
      en: "The internship in this large sector was very useful.",
      wordsUsed: ["Praktikum", "Branche"]
    },
    {
      de: "Der Dozent erklärt die schwierigen Grammatikregeln sehr verständlich.",
      en: "The lecturer explains the difficult grammar rules very clearly.",
      wordsUsed: ["Dozent", "erklären"]
    },
    {
      de: "Wir müssen das Projekt bis nächste Woche Freitag erfolgreich abschließen.",
      en: "We must successfully complete the project by next Friday.",
      wordsUsed: ["Projekt", "abschließen"]
    },
    {
      de: "Meine Kollegin leitet die wöchentliche Besprechung im Konferenzraum.",
      en: "My colleague leads the weekly meeting in the conference room.",
      wordsUsed: ["Kollegin", "Besprechung"]
    }
  ],
  "People & Relationships": [
    {
      de: "Sie haben in der Schule eine lebenslange Freundschaft geschlossen.",
      en: "They formed a lifelong friendship in school.",
      wordsUsed: ["Freundschaft"]
    },
    {
      de: "Ich möchte meine neuen Nachbarn besser kennenlernen.",
      en: "I would like to get to know my new neighbors better.",
      wordsUsed: ["Nachbar", "kennenlernen"]
    },
    {
      de: "Die Familie hat eine tiefe Beziehung zueinander.",
      en: "The family has a deep relationship with one another.",
      wordsUsed: ["Beziehung"]
    },
    {
      de: "Eine gute Beziehung basiert immer auf gegenseitigem Vertrauen.",
      en: "A good relationship is always based on mutual trust.",
      wordsUsed: ["Vertrauen"]
    },
    {
      de: "Sie haben viele gemeinsame Interessen und reisen oft zusammen.",
      en: "They have many shared interests and often travel together.",
      wordsUsed: ["gemeinsam", "zusammen"]
    },
    {
      de: "Die Nachbarn haben uns freundlich zu ihrer Einweihungsparty eingeladen.",
      en: "The neighbors friendly invited us to their housewarming party.",
      wordsUsed: ["Nachbar", "einladen"]
    },
    {
      de: "Wir pflegen seit vielen Jahren einen sehr engen und ehrlichen Kontakt.",
      en: "We have been maintaining a very close and honest contact for many years.",
      wordsUsed: ["Kontakt", "ehrlich"]
    },
    {
      de: "Vertrauen und gegenseitiger Respekt sind die Basis jeder guten Ehe.",
      en: "Trust and mutual respect are the basis of any good marriage.",
      wordsUsed: ["Vertrauen", "Respekt"]
    }
  ],
  "Travel & Transportation": [
    {
      de: "Wegen eines schweren Unfalls stehen wir seit einer Stunde im Stau.",
      en: "Because of a serious accident, we have been stuck in a traffic jam for an hour.",
      wordsUsed: ["Stau"]
    },
    {
      de: "Der Flughafen ist sehr groß und das Flugzeug fliegt pünktlich ab.",
      en: "The airport is very large and the airplane departs on time.",
      wordsUsed: ["Flughafen", "Flugzeug", "pünktlich"]
    },
    {
      de: "Ich muss noch eine Fahrkarte am Automaten für die Haltestelle kaufen.",
      en: "I still need to buy a ticket at the machine for the stop.",
      wordsUsed: ["Fahrkarte", "Haltestelle"]
    },
    {
      de: "Haben Sie Ihren Urlaub schon für den nächsten Sommer gebucht?",
      en: "Have you already booked your vacation for next summer?",
      wordsUsed: ["Urlaub", "buchen"]
    },
    {
      de: "Die Verspätung des Zuges beträgt leider fünfzehn Minuten.",
      en: "The train's delay is unfortunately fifteen minutes.",
      wordsUsed: ["Verspätung"]
    },
    {
      de: "Die Passagiere müssen vor dem Abflug ihr Gepäck am Schalter abgeben.",
      en: "The passengers must hand in their luggage at the counter before departure.",
      wordsUsed: ["Passagier", "Gepäck"]
    },
    {
      de: "Ich nehme den Bus, weil es im Stadtzentrum keine Parkplätze gibt.",
      en: "I take the bus because there are no parking spaces in the city center.",
      wordsUsed: ["Bus", "Stadtzentrum"]
    },
    {
      de: "Der Fahrschein ist im gesamten Stadtgebiet für alle U-Bahnen gültig.",
      en: "The ticket is valid for all subways in the entire city area.",
      wordsUsed: ["Fahrschein", "gültig"]
    }
  ],
  "Communication": [
    {
      de: "Kannst du für mich diesen Brief ins Deutsche übersetzen?",
      en: "Can you translate this letter into German for me?",
      wordsUsed: ["übersetzen"]
    },
    {
      de: "Ich werde dich heute Abend anrufen, wenn ich zu Hause bin.",
      en: "I will call you tonight when I am at home.",
      wordsUsed: ["anrufen"]
    },
    {
      de: "Die Nachricht kam überraschend, aber wir haben uns gefreut.",
      en: "The news came surprisingly, but we were glad.",
      wordsUsed: ["Nachricht"]
    },
    {
      de: "Wir müssen dieses wichtige Thema persönlich im Raum besprechen.",
      en: "We need to discuss this important topic in person in the room.",
      wordsUsed: ["persönlich", "Raum"]
    },
    {
      de: "Er hat mir eine ausführliche E-Mail mit allen Informationen geschickt.",
      en: "He sent me a detailed email with all the information.",
      wordsUsed: ["ausführlich", "schicken"]
    },
    {
      de: "Wir sollten die Angelegenheit telefonisch oder in einer Videokonferenz klären.",
      en: "We should clarify the matter over the phone or in a video conference.",
      wordsUsed: ["telefonisch", "klären"]
    },
    {
      de: "Die deutliche Aussprache ist beim Lernen einer neuen Fremdsprache entscheidend.",
      en: "Clear pronunciation is crucial when learning a new foreign language.",
      wordsUsed: ["Aussprache", "deutlich"]
    }
  ],
  "Food & Dining": [
    {
      de: "Die Nudeln mit Gemüse schmecken in diesem Restaurant ausgezeichnet.",
      en: "The pasta with vegetables tastes excellent in this restaurant.",
      wordsUsed: ["Nudel", "Gemüse", "schmecken", "ausgezeichnet"]
    },
    {
      de: "Ich backe am Wochenende ein frisches Brötchen für das Frühstück.",
      en: "I bake a fresh bread roll for breakfast on the weekend.",
      wordsUsed: ["backen", "Brötchen"]
    },
    {
      de: "Dieses traditionelle Gericht wird mit Reis und Salat serviert.",
      en: "This traditional dish is served with rice and salad.",
      wordsUsed: ["Gericht", "Reis", "Salat"]
    },
    {
      de: "Geben Sie bitte etwas Salz in kochendes Wasser für das Gemüse.",
      en: "Please put some salt into boiling water for the vegetables.",
      wordsUsed: ["Salz", "kochen", "Gemüse"]
    },
    {
      de: "Eine ausgewogene Mahlzeit enthält frisches Obst und Gemüse.",
      en: "A balanced meal contains fresh fruit and vegetables.",
      wordsUsed: ["Mahlzeit", "Obst", "Gemüse"]
    },
    {
      de: "Ich trinke meinen Kaffee am liebsten schwarz und ohne Zucker.",
      en: "I prefer to drink my coffee black and without sugar.",
      wordsUsed: ["Kaffee", "Zucker"]
    },
    {
      de: "Die Suppe schmeckt mir hervorragend, da sie mit frischen Kräutern gewürzt ist.",
      en: "The soup tastes excellent to me because it is seasoned with fresh herbs.",
      wordsUsed: ["schmecken", "frisch"]
    },
    {
      de: "Der Kellner bringt uns die Speisekarte und empfiehlt die Spezialität des Hauses.",
      en: "The waiter brings us the menu and recommends the specialty of the house.",
      wordsUsed: ["Kellner", "Speisekarte"]
    }
  ],
  "Health & Body": [
    {
      de: "Der Zahnarzt empfiehlt, eine neue Tablette gegen die Schmerzen zu nehmen.",
      en: "The dentist recommends taking a new tablet for the pain.",
      wordsUsed: ["Zahnarzt", "Tablette", "Schmerz"]
    },
    {
      de: "Er hat hohes Fieber und eine starke Erkältung, deshalb bleibt er im Bett.",
      en: "He has a high fever and a strong cold, which is why he stays in bed.",
      wordsUsed: ["Fieber", "Erkältung"]
    },
    {
      de: "Das Krankenhaus hat neue Medikamente für diese seltene Krankheit bestellt.",
      en: "The hospital ordered new medicines for this rare illness.",
      wordsUsed: ["Krankenhaus", "Medikament", "Krankheit"]
    },
    {
      de: "Der Arzt untersucht den Patienten sehr geduldig und ruhig.",
      en: "The doctor examines the patient very patiently and calmly.",
      wordsUsed: ["Arzt", "ruhig"]
    },
    {
      de: "Regelmäßige Bewegung an der frischen Luft stärkt das Immunsystem.",
      en: "Regular exercise in the fresh air strengthens the immune system.",
      wordsUsed: ["Bewegung", "stärken"]
    },
    {
      de: "Die Apothekerin hat mir eine wirksame Salbe gegen den Ausschlag empfohlen.",
      en: "The pharmacist recommended an effective ointment to me for the rash.",
      wordsUsed: ["Apothekerin", "empfehlen"]
    },
    {
      de: "Ich habe einen Termin beim Hausarzt zur jährlichen Vorsorgeuntersuchung.",
      en: "I have an appointment with the family doctor for the annual preventive medical examination.",
      wordsUsed: ["Termin", "Hausarzt"]
    }
  ],
  "Money & Shopping": [
    {
      de: "Ich zahle meistens mit Bargeld, aber man kann auch das Konto nutzen.",
      en: "I usually pay with cash, but one can also use the account.",
      wordsUsed: ["Bargeld", "zahlen", "Konto"]
    },
    {
      de: "Die Rechnung enthält bereits einen sehr hohen Rabatt für Kunden.",
      en: "The invoice already contains a very high discount for customers.",
      wordsUsed: ["Rechnung", "Rabatt"]
    },
    {
      de: "Wir müssen jeden Monat Steuern zahlen und sparen für die Zukunft.",
      en: "We have to pay taxes every month and save for the future.",
      wordsUsed: ["Steuer", "zahlen", "sparen"]
    },
    {
      de: "Der Betrag auf dem Kassenbon ist niedriger als erwartet.",
      en: "The amount on the receipt is lower than expected.",
      wordsUsed: ["Betrag"]
    },
    {
      de: "Kunden können an der Kasse sowohl bar als auch kontaktlos bezahlen.",
      en: "Customers can pay at the checkout both in cash and contactlessly.",
      wordsUsed: ["Kasse", "bezahlen"]
    },
    {
      de: "Ich vergleiche immer die Preise im Internet, um Geld zu sparen.",
      en: "I always compare prices on the internet to save money.",
      wordsUsed: ["Preis", "sparen"]
    },
    {
      de: "Sie hat die Ware reklamiert und den vollen Kaufpreis zurückerhalten.",
      en: "She complained about the product and received the full purchase price back.",
      wordsUsed: ["Ware", "Kaufpreis"]
    }
  ],
  "Time & Schedule": [
    {
      de: "Die Besprechung wird voraussichtlich eine Stunde dauern.",
      en: "The meeting is expected to take an hour.",
      wordsUsed: ["voraussichtlich", "dauern"]
    },
    {
      de: "Wir müssen einen neuen Termin für nächste Woche vereinbaren.",
      en: "We need to arrange a new appointment for next week.",
      wordsUsed: ["vereinbaren"]
    },
    {
      de: "Bitte kommen Sie pünktlich, damit wir rechtzeitig anfangen können.",
      en: "Please arrive on time so we can start in a timely manner.",
      wordsUsed: ["pünktlich", "rechtzeitig"]
    },
    {
      de: "Ich muss den geplanten Ausflug auf morgen verschieben.",
      en: "I have to postpone the planned trip until tomorrow.",
      wordsUsed: ["verschieben"]
    },
    {
      de: "Mittlerweile haben wir uns an den neuen Zeitplan gewöhnt.",
      en: "Meanwhile we have gotten used to the new schedule.",
      wordsUsed: ["mittlerweile"]
    },
    {
      de: "Wir müssen den Termin absagen, weil der Abteilungsleiter krank ist.",
      en: "We have to cancel the appointment because the department manager is sick.",
      wordsUsed: ["absagen", "krank"]
    },
    {
      de: "Die Arbeiten werden voraussichtlich bis zum Monatsende abgeschlossen sein.",
      en: "The work is expected to be completed by the end of the month.",
      wordsUsed: ["voraussichtlich", "Monatsende"]
    },
    {
      de: "Bitte gib mir rechtzeitig Bescheid, falls du dich verspäten solltest.",
      en: "Please let me know in time if you should be late.",
      wordsUsed: ["rechtzeitig", "Bescheid"]
    }
  ],
  "Environment & Nature": [
    {
      de: "Der Umweltschutz ist wichtig, um die Natur und den Wald zu schützen.",
      en: "Environmental protection is important to protect nature and the forest.",
      wordsUsed: ["Umweltschutz", "Natur", "Wald", "schützen"]
    },
    {
      de: "Wir müssen Plastikmüll vermeiden, um das globale Klima zu retten.",
      en: "We must avoid plastic waste to save the global climate.",
      wordsUsed: ["vermeiden", "Klima"]
    },
    {
      de: "Ein schwerer Sturm hat gestern die Bäume im Wald beschädigt.",
      en: "A severe storm damaged the trees in the forest yesterday.",
      wordsUsed: ["Sturm", "Wald"]
    },
    {
      de: "Die Luft in den Bergen ist sehr sauber und frisch.",
      en: "The air in the mountains is very clean and fresh.",
      wordsUsed: ["Luft", "sauber"]
    },
    {
      de: "Wir trennen unseren Müll sorgfältig, um wertvolle Rohstoffe zu recyceln.",
      en: "We separate our garbage carefully in order to recycle valuable raw materials.",
      wordsUsed: ["Müll", "Rohstoff"]
    },
    {
      de: "Der Klimawandel stellt eine große Bedrohung für unsere Artenvielfalt dar.",
      en: "Climate change represents a major threat to our biodiversity.",
      wordsUsed: ["Klimawandel", "Bedrohung"]
    },
    {
      de: "In diesem Naturschutzgebiet brüten viele seltene Vogelarten im Frühling.",
      en: "In this nature reserve, many rare bird species breed in spring.",
      wordsUsed: ["Naturschutzgebiet", "selten"]
    }
  ],
  "Leisure & Culture": [
    {
      de: "Das Konzert der berühmten Band war ein riesiger Erfolg.",
      en: "The concert of the famous band was a huge success.",
      wordsUsed: ["Konzert", "Erfolg"]
    },
    {
      de: "Der Künstler zeigt seine neuen Bilder im staatlichen Museum.",
      en: "The artist shows his new paintings in the state museum.",
      wordsUsed: ["Künstler", "Museum"]
    },
    {
      de: "Die Mannschaft feiert den wichtigen Sieg und begeistert das Publikum.",
      en: "The team celebrates the important victory and inspires the audience.",
      wordsUsed: ["Mannschaft", "Sieg", "begeistern"]
    },
    {
      de: "Sie gewinnt den ersten Platz im Wettbewerb und freut sich sehr.",
      en: "She wins the first place in the competition and is very happy.",
      wordsUsed: ["gewinnen"]
    },
    {
      de: "Die Ausstellung moderner Kunst zieht wöchentlich tausende Besucher an.",
      en: "The exhibition of modern art attracts thousands of visitors weekly.",
      wordsUsed: ["Ausstellung", "Kunst"]
    },
    {
      de: "In meiner Freizeit spiele ich gerne Gitarre oder gehe im Wald joggen.",
      en: "In my free time, I like to play the guitar or go jogging in the forest.",
      wordsUsed: ["Freizeit", "spielen"]
    },
    {
      de: "Das Theaterstück war absolut faszinierend und die Schauspieler spielten großartig.",
      en: "The play was absolutely fascinating and the actors played magnificently.",
      wordsUsed: ["Theaterstück", "Schauspieler"]
    }
  ],
  "Emotions & Opinions": [
    {
      de: "Ich habe große Zweifel an seiner ehrlichen Meinung.",
      en: "I have great doubts about his honest opinion.",
      wordsUsed: ["Zweifel", "Meinung"]
    },
    {
      de: "Mein Gefühl sagt mir, dass wir ihm volles Vertrauen schenken können.",
      en: "My feeling tells me that we can give him full trust.",
      wordsUsed: ["Gefühl", "Vertrauen"]
    },
    {
      de: "Er freut sich sehr über das schöne Geschenk.",
      en: "He is very happy about the beautiful gift.",
      wordsUsed: ["sich freuen"]
    },
    {
      de: "Wir müssen sie mit Argumenten von unserer Idee überzeugen.",
      en: "We must convince them of our idea with arguments.",
      wordsUsed: ["überzeugen"]
    },
    {
      de: "Ich bin fest davon überzeugt, dass wir diese Krise gemeinsam meistern.",
      en: "I am firmly convinced that we will master this crisis together.",
      wordsUsed: ["überzeugt", "gemeinsam"]
    },
    {
      de: "Es tut mir aufrichtig leid, dass ich dich gestern enttäuscht habe.",
      en: "I am sincerely sorry that I disappointed you yesterday.",
      wordsUsed: ["leid", "enttäuschen"]
    },
    {
      de: "Ihre positive Einstellung gibt dem gesamten Team neue Hoffnung.",
      en: "Her positive attitude gives new hope to the entire team.",
      wordsUsed: ["Einstellung", "Hoffnung"]
    }
  ],
  "Technology & Media": [
    {
      de: "Ich muss ein neues Antivirenprogramm installieren.",
      en: "I need to install a new antivirus program.",
      wordsUsed: ["installieren"]
    },
    {
      de: "Vergiss nicht, deine wichtigen Dokumente im Netzwerk zu speichern.",
      en: "Do not forget to save your important documents in the network.",
      wordsUsed: ["Netzwerk", "speichern"]
    },
    {
      de: "Die neue Tastatur und der flache Bildschirm sind sehr modern.",
      en: "The new keyboard and the flat screen are very modern.",
      wordsUsed: ["Tastatur", "Bildschirm"]
    },
    {
      de: "Die digitale Kommunikation hat sich stark verändert.",
      en: "Digital communication has changed significantly.",
      wordsUsed: ["digital"]
    },
    {
      de: "Das neueste Update behebt alle Sicherheitslücken im Betriebssystem.",
      en: "The latest update fixes all security vulnerabilities in the operating system.",
      wordsUsed: ["Update", "Sicherheitslücke"]
    },
    {
      de: "Sie hat ihre Fotos auf der externen Festplatte gesichert, um Speicherplatz zu sparen.",
      en: "She backed up her photos on the external hard drive to save storage space.",
      wordsUsed: ["sichern", "Festplatte"]
    },
    {
      de: "Die künstliche Intelligenz verändert die moderne Arbeitswelt grundlegend.",
      en: "Artificial intelligence is fundamentally changing the modern working world.",
      wordsUsed: ["Intelligenz", "verändern"]
    }
  ],
  "Society & Law": [
    {
      de: "Die Regierung hat ein neues Gesetz für die Sicherheit verabschiedet.",
      en: "The government has passed a new law for safety.",
      wordsUsed: ["Regierung", "Gesetz", "Sicherheit"]
    },
    {
      de: "Der Staat garantiert die Rechte für alle freien Bürger.",
      en: "The state guarantees the rights for all free citizens.",
      wordsUsed: ["Staat"]
    },
    {
      de: "Das Parlament debattiert stundenlang über ein neues Verbot.",
      en: "The parliament debates for hours about a new prohibition.",
      wordsUsed: ["Parlament"]
    },
    {
      de: "Es ist verboten, in diesem staatlichen Gebäude zu rauchen.",
      en: "It is forbidden to smoke in this state building.",
      wordsUsed: ["verbieten"]
    },
    {
      de: "Die Einhaltung der Gesetze sorgt für Frieden und Ordnung in der Gesellschaft.",
      en: "Compliance with laws ensures peace and order in society.",
      wordsUsed: ["Gesetz", "Gesellschaft"]
    },
    {
      de: "Jeder Bürger hat das verfassungsmäßige Recht auf freie Meinungsäußerung.",
      en: "Every citizen has the constitutional right to freedom of expression.",
      wordsUsed: ["Recht", "Meinungsäußerung"]
    },
    {
      de: "Die Polizei sorgt auf den Straßen für die Sicherheit aller Verkehrsteilnehmer.",
      en: "The police ensure the safety of all road users on the streets.",
      wordsUsed: ["Polizei", "Sicherheit"]
    }
  ],
  "Buildings & Places": [
    {
      de: "Der Balkon dieser hellen Wohnung schaut direkt auf die ruhige Straße.",
      en: "The balcony of this bright apartment looks directly onto the quiet street.",
      wordsUsed: ["Balkon", "Straße"]
    },
    {
      de: "Wir müssen die alten Treppen im Gebäude dringend reparieren.",
      en: "We urgently need to repair the old stairs in the building.",
      wordsUsed: ["Treppe", "reparieren"]
    },
    {
      de: "Der Aufzug ist defekt, deshalb müssen wir die Treppe nehmen.",
      en: "The elevator is out of order, so we have to take the stairs.",
      wordsUsed: ["Aufzug", "Treppe"]
    },
    {
      de: "Sie planen, ein neues Einkaufszentrum im Stadtzentrum zu bauen.",
      en: "They plan to build a new shopping center in the city center.",
      wordsUsed: ["bauen"]
    },
    {
      de: "Die neue Bibliothek im Stadtviertel bietet many ruhige Arbeitsplätze.",
      en: "The new library in the neighborhood offers many quiet workplaces.",
      wordsUsed: ["Bibliothek", "Arbeitsplatz"]
    },
    {
      de: "Wir wohnen in einem sanierten Altbau mit hohen Decken und großen Fenstern.",
      en: "We live in a renovated old building with high ceilings and large windows.",
      wordsUsed: ["Altbau", "Fenster"]
    },
    {
      de: "Der Hauptbahnhof ist ein zentraler Verkehrsknotenpunkt mit vielen Geschäften.",
      en: "The main station is a central transport hub with many shops.",
      wordsUsed: ["Hauptbahnhof", "Geschäft"]
    }
  ]
};
