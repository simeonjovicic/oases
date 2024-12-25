DROP DATABASE IF EXISTS db;
CREATE DATABASE IF NOT EXISTS db;

USE db;

CREATE TABLE IF NOT EXISTS services (
    id INT auto_increment PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    timeSpan VARCHAR(50) NOT NULL,
    image TEXT,
    description TEXT
);

INSERT INTO services (id, name, category, price, timeSpan, image, description) VALUES
(1, 'Maniküre & Pediküre', 'Nägel', 73, '80min', NULL, 'Je nach Aufwand kann es zu einem Aufpreis kommen.'),
(2, 'Maniküre', 'Nägel', 30, '40min', NULL, 'Hände reichen, Hände zeigen – wir tun es ständig, oft unbewusst. Dabei gelten gepflegte, im Idealfall regelmäßig vom Profi manikürte Hände als nachhaltiger Eindruck und Vertrauensgenerator. Deshalb geht das Thema Männer wie Frauen an. Blicke fallen eben aufs Gesicht und die Hände. Eine professionelle Maniküre dauert etwa 30 bis 40 Minuten'),
(3, 'Pediküre', 'Nägel', 43, '40min', NULL, 'A soothing massage using warm stones to relax muscles and improve blood flow while alleviating tension.'),
(4, 'Nagelmodellage mit Gel - Neues Set', 'Nägel', 70, '75min', NULL, 'Nagelmodellage mit Acryl (ohne Nagellack)'),
(5, 'Nagelmodellage auffüllen mit Farbe normal', 'Nägel', 55, '75min', NULL, NULL),
(6, 'Nagelmodellage auffüllen mit Farbe langer', 'Nägel', 60, '75min', NULL, NULL),
(7, 'Shellac mit Maniküre', 'Nägel', 50, '60min', NULL, 'Nagelmodellage auffüllen mit Gel (ohne Lack)'),
(8, 'Pediküre mit Shellac', 'Nägel', 60, '60min', NULL, 'Nervt es dich, dass Nagellack nicht lange genug hält? Dann ist Gel eine gute Alternative für dich. Bei der Pediküre kannst du deine Füße zunächst von abgestorbenen Hautzellen reinigen lassen, und nach einer Pflegebahandlung deine Nägel mit dieser Gel-Variante versehen lassen. Für garantiert kratz- und stoßfeste Nägel - und zwar bis zu 4 Wochen!'),
(9, 'Maniküre mit Gellack / Shellac', 'Nägel', 55, '60min', NULL, 'Nervt es dich, dass Nagellack nicht lange genug hält? Dann ist diese Behandlung eine gute Alternative für dich. Bei der Maniküre kannst du deine Hände zunächst von abgestorbenen Hautzellen reinigen lassen, und nach einer Pflegebahandlung deine Nägel mit dieser Gel-Variante versehen lassen. Für bis zu 4-wöchigen Halt und Schutz gegen Kratzer und Abblättern!'),
(10, 'Pediküre plus', 'Nägel', 45, '50min', NULL, 'Eine Express Pediküre eigent sich für alle, die wenig Zeit haben. Sie verwandelt deine Füße: Abgestorbene Hautzellen werden entfernt, die Nägel in Form gebracht und wenn du magst, mit deiner Lieblingsfarbe versehen. Freu dich also auf zarte Füße und glänzende Fußnägel. So bist du immer bereit für Flip Flop, Sandale oder was auch immer kommen mag.'),
(11, 'Pediküre plus + Gellack', 'Nägel', 60, '75min', NULL, 'Eine Express Pediküre eigent sich für alle, die wenig Zeit haben. Sie verwandelt deine Füße: Abgestorbene Hautzellen werden entfernt, die Nägel in Form gebracht und wenn du magst, mit deiner Lieblingsfarbe versehen. Freu dich also auf zarte Füße und glänzende Fußnägel. So bist du immer bereit für Flip Flop, Sandale oder was auch immer kommen mag.'),
(12, 'Diabetes Fußpflege', 'Nägel', 45, '45min', NULL, 'Bei der Fußpflege werden verschiedene Schritte ausgeführt, um die Haut deiner Füße gesund und zart werden zu lassen. Hornhaut wird entfernt und Nägel fachgerecht in Form geschnitten.'),
(13, 'Nagelmodellage auffüllen', 'Nägel', 50, '90min', NULL, NULL),
(14, 'Nagelmodellage - Neues Set mit Gel', 'Nägel', 60, '75min', NULL, 'Dir gefallen deine Fingernägel nicht? Dann könnte die Nagelmodellage mit Acryl eine super Lösung für dich sein. Acryl-Nägel verstärken die Naturnägel und wirken im Vergleich zu Gel-Nägeln noch natürlicher. Damit die kleinen Kunstwerke halten können, wird zunächst der Naturnagel an der Oberfläche leicht angeraut und mit einem Primer versehen, um die Acrylschicht auf dem Naturnagel gut haltbar zu machen. Du möchtest deine Nägel gerne verlängern? Kein Problem, dazu wird zusätzlich noch eine Schablone angebracht. Mit dem Pinsel wird dann die Flüssigkeit und im Anschluss das Acrylpulver aufgetragen.'),
(15, 'Nagelmodellage - Auffüllen mit Gel extra lang(stiletto nails)', 'Nägel', 60, '90min', NULL, 'Das Auffüllen der Nägel wird etwa 3 bis 4 Wochen nach der ersten Nagelmodellage empfohlen. Eine schnelle Auffüllung der Nägel ist der beste Weg, um das Beste aus deinen Nagelverlängerungen herauszuholen.'),
(16, 'Nagelmodellage - Auffüllen mit FRENCH', 'Nägel', 60, '75min', NULL, 'Das Auffüllen der Nägel wird etwa 3 bis 4 Wochen nach der ersten Nagelmodellage empfohlen. Eine schnelle Auffüllung der Nägel ist der beste Weg, um das Beste aus deinen Nagelverlängerungen herauszuholen.'),
(17, 'Damen Waxing - Bikini(nur Seite)', 'Haarentfernung', 35, '30min', NULL, 'Um ein tolles Ergebnis zu garantieren, sollte dein Haar, das entfernt werden soll, vor dem Termin mindestens 0,5 cm lang sein. Das bedeutet im Durchschnitt zwei Wochen wachsen lassen.'),
(18, 'Damen Waxing - Bikini', 'Haarentfernung', 50, '45min', NULL, 'Um ein tolles Ergebnis zu garantieren, sollte dein Haar, das entfernt werden soll, vor dem Termin mindestens 0,5 cm lang sein. Das bedeutet im Durchschnitt zwei Wochen wachsen lassen.'),
(19, 'Damen Waxing - Achseln', 'Haarentfernung', 20, '15min', NULL, 'Um ein tolles Ergebnis zu garantieren, sollte dein Haar, das entfernt werden soll, vor dem Termin mindestens 0,5 cm lang sein. Das bedeutet im Durchschnitt zwei Wochen wachsen lassen.'),
(20, 'Herren Waxing- Rücken', 'Haarentfernung', 50, '45min', NULL, 'Um ein tolles Ergebnis zu garantieren, sollte dein Haar, das entfernt werden soll, vor dem Termin mindestens 0,5 cm lang sein. Das bedeutet im Durchschnitt zwei Wochen wachsen lassen.');
