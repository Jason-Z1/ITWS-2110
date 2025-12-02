<?php
// shows results of all Part 2 queries

// Database connection
$host = "localhost";
$user = "root"; // default for XAMPP
$pass = ""; // default empty password for XAMPP
$db   = "websyslab8";

$mysqli = new mysqli($host, $user, $pass, $db);

if ($mysqli->connect_errno) {
    die("Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error);
}

// Helper to run a query and print an HTML table
function printQueryTable($mysqli, $title, $sql) {
    echo "<section>";
    echo "<h2>" . htmlspecialchars($title) . "</h2>";
    echo "<pre>" . htmlspecialchars($sql) . "</pre>";

    if (!$result = $mysqli->query($sql)) {
        echo "<p style='color:red;'>Query error: " . htmlspecialchars($mysqli->error) . "</p>";
        echo "</section>";
        return;
    }

    if ($result->num_rows === 0) {
        echo "<p>No rows returned.</p>";
        echo "</section>";
        return;
    }

    echo "<table border='1' cellpadding='5' cellspacing='0'>";
    echo "<thead><tr>";
    $fields = $result->fetch_fields();
    foreach ($fields as $field) {
        echo "<th>" . htmlspecialchars($field->name) . "</th>";
    }
    echo "</tr></thead><tbody>";

    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        foreach ($row as $value) {
            echo "<td>" . htmlspecialchars((string)$value) . "</td>";
        }
        echo "</tr>";
    }

    echo "</tbody></table>";
    echo "</section>";

    $result->free();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Lab 8 – SQL &amp; PHP Results</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 2rem;
            background: #f5f5f5;
        }
        h1 {
            text-align: center;
        }
        section {
            margin-bottom: 2rem;
            padding: 1rem;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 4px rgba(0,0,0,0.1);
        }
        pre {
            background: #eee;
            padding: 0.5rem;
            overflow-x: auto;
        }
        table {
            border-collapse: collapse;
            margin-top: 0.5rem;
            background: #fafafa;
        }
        th {
            background: #ddd;
        }
    </style>
</head>
<body>
    <h1>Lab 8 – Part 2 Query Output</h1>

    <?php
    // 2.7(a) All students ordered by RIN
    $sql1 = "SELECT * FROM students ORDER BY rin;";
    printQueryTable($mysqli, "2.7(a) Students ordered by RIN", $sql1);

    // 2.7(b) All students ordered by last name
    $sql2 = "SELECT * FROM students ORDER BY last_name, first_name;";
    printQueryTable($mysqli, "2.7(b) Students ordered by last name", $sql2);

    // 2.7(c) All students ordered by RCSID
    $sql3 = "SELECT * FROM students ORDER BY rcsID;";
    printQueryTable($mysqli, "2.7(c) Students ordered by RCSID", $sql3);

    // 2.7(d) All students ordered by first name
    $sql4 = "SELECT * FROM students ORDER BY first_name, last_name;";
    printQueryTable($mysqli, "2.7(d) Students ordered by first name", $sql4);

    // 2.8 Students (rin, name, address) whose grade > 90 in any course
    $sql5 = "
        SELECT DISTINCT
            s.rin,
            s.first_name,
            s.last_name,
            s.street,
            s.city,
            s.state,
            s.zip
        FROM students AS s
        JOIN grades   AS g ON s.rin = g.rin
        WHERE g.grade > 90;
    ";
    printQueryTable($mysqli, "2.8 Students with any grade > 90 (with address)", $sql5);

    // 2.9 Average grade in each course
    $sql6 = "
        SELECT
            c.crn,
            c.prefix,
            c.number,
            c.title,
            AVG(g.grade) AS avg_grade
        FROM courses AS c
        JOIN grades  AS g ON c.crn = g.crn
        GROUP BY c.crn, c.prefix, c.number, c.title;
    ";
    printQueryTable($mysqli, "2.9 Average grade in each course", $sql6);

    // 2.10 Number of students in each course
    $sql7 = "
        SELECT
            c.crn,
            c.prefix,
            c.number,
            c.title,
            COUNT(DISTINCT g.rin) AS num_students
        FROM courses AS c
        LEFT JOIN grades AS g ON c.crn = g.crn
        GROUP BY c.crn, c.prefix, c.number, c.title;
    ";
    printQueryTable($mysqli, "2.10 Number of students in each course", $sql7);

    $mysqli->close();
    ?>

</body>
</html>
