<?php

error_reporting(-1);

// Connect to Database
include 'dbConnection.php';

// Todo Request Checks

/*
GET all data from persons

Required GET
	- 'persons'
	
Returns
	- all Persons in JSON format
*/
if (isset($_GET["persons"])){
	$result = $conn->prepare("SELECT * FROM persons");
	$result->execute();
	
	$result->bind_result($id, $activated, $lastname, $firstname, $onlinetill, $lastvisit);
	$rows = array();
	$row = array();
	while($result->fetch()) {
		$row['id'] = $id;
		$row['activated'] = strtotime($activated) * 1000;
		$row['lastname'] = $lastname;
		$row['firstname'] = $firstname;
		$row['onlinetill'] = strtotime($onlinetill) * 1000;
		$row['lastvisit'] = strtotime($lastvisit) * 1000;
		
		array_push($rows,$row);
	}
	print json_encode($rows);
	$result->close();
}

/*
GET a specified person by id

Required GET
	- 'id'
	
Returns
	- a person in JSON format 
*/
if (isset($_GET["person"])){
	
	$id = $_GET['person'];
	
	$result = $conn->prepare("SELECT * FROM persons Where id = ?");
	$result->bind_param('i', $id);
	$result->execute();
	
	$result->bind_result($id, $activated, $lastname, $firstname, $onlinetill, $lastvisit);
	$rows = array();
	$row = array();
	while($result->fetch()) {
		$row['id'] = $id;
		$row['activated'] = strtotime($activated) * 1000;
		$row['lastname'] = $lastname;
		$row['firstname'] = $firstname;
		$row['onlinetill'] = strtotime($onlinetill) * 1000;
		$row['lastvisit'] = strtotime($lastvisit) * 1000;
		
		array_push($rows,$row);
	}
	print json_encode($rows);
	$result->close();
}

/*
UPDATE onlinetill on a person by id

Required POST:
	- 'id'
	- 'minutes'
*/
if (isset($_GET["time"])) {
	
	$postdata = file_get_contents("php://input");
	$request = json_decode($postdata);
	$id = $request->id;
	$minutes = $request->minutes*60;
	
	//echo $minutes."\n";
	
	$result = $conn->prepare("SELECT onlinetill FROM persons WHERE id=?");
	$result->bind_param('i', $id);
	$result->execute();
	
	$result->bind_result($onlinetill);
	$rows = array();
	$row = array();
	while($result->fetch()) {
		$row['onlinetill'] = strtotime($onlinetill);
		
		array_push($rows,$row);
	}
	
	$num = $result->num_rows; 
	//echo $row['onlinetill']."\n";
	//echo time()."\n";
	$onlinetill = $row['onlinetill'];
	if($onlinetill > time()){
		$onlinetill = $onlinetill + $minutes;
	}else{
		$onlinetill = time() + $minutes;
	}

	$time = date('Y-m-d H:i:s',$onlinetill);
	
	if ($result->num_rows > 0) {
	$result = $conn->prepare("UPDATE persons SET onlinetill=? WHERE id=?");
	$result->bind_param('si',$time, $id);
	$result->execute();
	}
	print json_encode(array($onlinetill,$time,time()));
}

/*
UPDATE onlinetill to actual time on a person by id

Required POST:
	- 'id'
*/
if (isset($_GET["reset"])) {
	
	$postdata = file_get_contents("php://input");
	$request = json_decode($postdata);
	$id = $request->id;
	
	$result = $conn->prepare("SELECT onlinetill FROM persons WHERE id=?");
	$result->bind_param('i', $id);
	$result->execute();

	while($result->fetch()) {
	}
	
	//echo $result->num_rows."\n";
	$time = date('Y-m-d H:i:s',time());
	
	if ($result->num_rows > 0) {
	$result = $conn->prepare("UPDATE persons SET onlinetill=? WHERE id=?");
	$result->bind_param('si',$time, $id);
	$result->execute();
	}
	print json_encode(array($onlinetill,$time,time()));
}

/*
INSERT new Person with firstname, lastname and actual time

Required POST:
	- 'firstname'
	- 'lastname'
*/
if (isset($_GET["add"])) {
	
	// just $_POST[''] will not work with Angular JS
	$postdata = file_get_contents("php://input");
	$request = json_decode($postdata);
	$firstname = $request->firstname;
	$lastname = $request->lastname;
	
	// set Timestamp to current time
	$time = date('Y-m-d H:i:s',time());
	
	// INSERT in persons
	// Todo: check if name exists
	$result = $conn->prepare("INSERT INTO `foenix_werkstatt`.`persons` (`id`, `activated`, `lastname`, `firstname`, `onlinetill`, `lastvisit`) VALUES (NULL, CURRENT_TIMESTAMP, ?, ?, ?, ?)");
	$result->bind_param('ssss', $lastname, $firstname, $time, $time);
	$result->execute();

	print json_encode(array($firstname,$lastname,$time,time()));
}

// Close DB Connection
$conn->close();
		
?>
