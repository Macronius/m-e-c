## QUESTION 1
App.js - around line 149
{categories.map((category) => (
    <Nav.Item key={category}>
    <LinkContainer
        //line 6 or line 7 ?
        to={`/search?category=${category}`}
        to={`/search/?category=${category}`}
        onClick={() => setSidebarIsOpen(false)}
    >
        <Nav.Link>{category}</Nav.Link>
    </LinkContainer>
    </Nav.Item>
))}
    (which one is correct? with or without the / after search before ?)



## QUESTION 2
SearchBox.jsx - around line 19
navigate( query ? `/search/?query=${query}` : '/search');
navigate( query ? `/search?query=${query}` : '/search');
    (which one is correct? with or without the / after search before ?)




## QUESTION 3
Is it mo correct to say...
() => () returns implicitly, while
() => {} can explicitly not return




## QUESTION 4
difference between isAdmin and isAuth?
isAuth simply means signed in
isAdmin means user has admin priviledge
...a user could have admin priviledges, while not currently being signed in


## QUESTION 5
when to use axios in the backend and when not to?
example:
    I have a mongoose mongo model..
    const order = await Order.find().populate('user', 'name')

    How do I know I didn't need axios for this ^ ?