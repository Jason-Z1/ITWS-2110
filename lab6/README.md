# Lab 6 - PHP, OOP, and Input Handling

In this lab, we develop a very basic calculator using PHP. The markup was provided for us, along with some sample code to start. 

# Questions

1) Explain what each of your classes and methods does, the order in which methods are invoked, and the flow of execution after one of the operation buttons has been clicked.

- The *Operation* class serves as the base class for all mathetmical operations.
- The *Constructor* validates that both the operands are numeric using is_numeric() and throws an exception if non-numeric values are provided. It also assigns the operands to protected member variables **$operand_1** and **$operand_2**
- The *operate()* methods are implemented by subclasses to perform the actual calculation.
- The *getEquation()* methods are also implemented by subclasses to return a formatted string representing the equation that they correspond to

*** Flow of Execution: ***

1. User Input: The user enters two numbers in the text fields and clicks one of the operation buttons (Add, Subtract, Multiply, or Divide)

2. Form Submission: The form submits via POST to *lab6.php*

3. Sever-side Processing: PHP checks if **$_SERVER['REQUEST_METHOD'] == 'POST'**. If it returns true, then it extracts *$o1* and *$o2* from **$_POST['op1']** and **$_POST['op2']**

4. Operation Selection: PHP checks which submit button was pressed using isset(). (Add -> new Addtion($o1, $o2), Sub -> new Subtraction($o1, $o2), ...)

5. Object Construction: The appropriate subclass constructor is called, the parent constructor validates numeric operands, and checks if the validation succeeds or fails. The operands are stored in member variables.

6. Result display: The code checks if *$op* is set (meaning an operation object was created). It calls **$op->getEquation()** and the result is echoed inside of the **<pre id="result">** element.

7. Error handling: Any exceptions caught are added to the *$err* array and errors are displayed in the pre element after the result.

8. Page render: The HTML form is rendered again, ready for another calculation.

---

2) Also explain how the application would differ if you were to use $_GET, and why this may or may not be preferable.

If we used *$_GET* instead of *$_POST*, the format data would be appended to the URL as query parameters, making all the input values visible in the browser address bar, history, and server logs. We would need to change the form's method attribute to "get" and replace all *$_POST* references with *$_GET* in the PHP code. While GET would allow calculations to be bookmarked and shared via URL, POST is more sutiable for this application because it performs action (calculation) rather than retrieving data, which keeps URLs clean, prevents cluttering browser history, and follows RESTful best practices where POST is used for operations that "do something" while GET is used for data retrieval.

---

3) Finally, please explain whether or not there might be another (better +/-) way to determine which button has been pressed and take the appropriate action

The only issue with the current approach is that it's repetitive and not scalable. A better solution would be to use a single button name with different values (e.g **<button type="submit" name="operation" value="Addition">Add </button>** ) for each operation button. Then in PHP, we could simply use **$class = $_POST['operation']; $op = new $class($o1, $o2);** after validating that the class exists. This would help eliminate repetitive code, making it easier to add new operations.