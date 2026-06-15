<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
    exit();
}

$type = $input['type'] ?? 'kontakt'; // 'tilmeld' or 'kontakt'
$to   = 'info@firstdrive.dk';

$holdLabels = [
    'korekort'       => 'Kørekort til bil',
    '17-aarige'      => 'Kørekort til bil - 17 årige',
    'generhvervelse' => 'Generhvervelse',
    'koreforbud'     => 'Køreforbud',
    'rutinetimer'    => 'Rutinetimer',
    'forstehjaelp'   => 'Førstehjælp',
];

$locationLabels = [
    'dragor'         => 'Dragør',
    'frederiksberg'  => 'Frederiksberg',
];

$holdLabel     = $holdLabels[$input['hold'] ?? ''] ?? ($input['hold'] ?? '-');
$locationLabel = $locationLabels[$input['location'] ?? ''] ?? ($input['location'] ?? '-');

if ($type === 'tilmeld') {
    $subject = '[' . $locationLabel . '] Ny tilmelding: ' . $holdLabel . ' — ' . ($input['navn'] ?? '');
    $body  = "NY TILMELDING\n";
    $body .= "=============\n\n";
    $body .= "Lokation:    " . $locationLabel . "\n";
    $body .= "Hold:        " . $holdLabel . "\n";
    $body .= "Holdstart:   " . ($input['holdstart'] ?? '-') . "\n\n";
    $body .= "Navn:        " . ($input['navn'] ?? '-') . "\n";
    $body .= "Fødselsdato: " . ($input['foedselsdato'] ?? '-') . "\n";
    $body .= "E-mail:      " . ($input['email'] ?? '-') . "\n";
    $body .= "Telefon:     " . ($input['telefon'] ?? '-') . "\n";
    $body .= "Adresse:     " . ($input['adresse'] ?? '-') . "\n";
    $body .= "Postnr. & By:" . ($input['postnrBy'] ?? '-') . "\n";
    $body .= "Gearkasse:   " . ($input['gearkasse'] ?? '-') . "\n\n";
    $body .= "Hvordan fandt du os: " . ($input['hvordan'] ?? '-') . "\n\n";
    $body .= "Besked:\n" . ($input['besked'] ?? '-') . "\n";
} else {
    $subject = '[' . $locationLabel . '] Ny besked fra ' . ($input['name'] ?? 'ukendt');
    $body  = "NY KONTAKTBESKED\n";
    $body .= "================\n\n";
    $body .= "Lokation: " . $locationLabel . "\n";
    $body .= "Navn:     " . ($input['name'] ?? '-') . "\n";
    $body .= "E-mail:   " . ($input['email'] ?? '-') . "\n";
    $body .= "Telefon:  " . ($input['phone'] ?? '-') . "\n\n";
    $body .= "Besked:\n" . ($input['message'] ?? '-') . "\n";
}

$headers  = "From: noreply@firstdrive.dk\r\n";
$headers .= "Reply-To: " . ($input['email'] ?? $to) . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = mail($to, $subject, $body, $headers);

if ($sent) {
    echo json_encode(['success' => true, 'message' => 'Mail sendt']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Mail fejlede']);
}
