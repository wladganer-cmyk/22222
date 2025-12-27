<?php
require_once 'config.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

try {
    // Сохранение заказа
    $stmt = $pdo->prepare("
        INSERT INTO orders (customer_name, phone, delivery_type, delivery_date, payment_method, total_amount, status)
        VALUES (?, ?, ?, ?, ?, ?, 'Рассмотрен')
    ");
    
    $stmt->execute([
        $data['name'],
        $data['phone'],
        $data['deliveryType'],
        $data['deliveryDate'],
        $data['paymentMethod'],
        $data['total']
    ]);
    
    $orderId = $pdo->lastInsertId();
    
    // Сохранение товаров заказа
    foreach ($data['items'] as $item) {
        $stmt = $pdo->prepare("
            INSERT INTO order_items (order_id, product_id, quantity, price)
            VALUES (?, ?, ?, ?)
        ");
        
        $stmt->execute([$orderId, $item['id'], $item['quantity'], $item['price']]);
    }
    
    echo json_encode(['success' => true, 'order_id' => $orderId]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>