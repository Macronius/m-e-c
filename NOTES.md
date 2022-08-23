## TO DO:
- change all contextDispatch to storeDispatch, because it makes more sense
- in PlaceOrderScreen, it might make sense to rename dispatch to localDispatch, sense it is locally scoped

14.  **Create Sign Up Screen**
     1.   create input form
     2.   handle submit
     3.   create backend api
15.  **Create Payment Screen**
     1.   -
     2.   -
     3.   -
16.  **Create Place Order Screen**
     1.   show cart items, payment, and address
17.  **Implement Place Order Action** - complex!!!
     1.   send an AJAX request
     2.   create order in the back end by creating an orderModel
     3.   redirect user to order details page
     4.   clear cart for new orders
18.  **Create Order[ed] Screen**
     1.   create backend api for order/:id
     2.   fetch order api in frontend
     3.   show order information in 2 columns
19.  **Pay Order By PayPal**
     1.   generate paypal client id
     2.   create backend orderRoutes .put() api to update order status after payment
     3.   install react-paypal-js
     4.   index.js wrapped App in PayPalScriptProvider higher-order-component
     5.   use usePayPalScriptReducer in OrderScreen
     6.   implement loadPaypalScript function
     7.   render paypal button
     8.   implement onApprove payment function
20.  **Display Order History**
     1.   create OrderHistoryScreen
     2.   create order history api
     3.   use api in frontend
21.  **User Profile Screen**
     1.   get user info from context
     2.   show user information
     3.   create user update api
     4.   update user info
22.  **Publish to Heroku**
     1.   create and config node project
     2.   serve build folder in frontend folder
     3.   create heroku account
     4.   connect it to github
     5.   create mongodb atlas database
     6.   set database connection in heroku env variables
     7.   commit and push
23.  **Sidebar**
24.  **Searchbox**
25.  **Search Screen**
     1.   the useEffect is utilized to fetch data from the database upon initial screen rendering
26.  **Create Admin Nav Menu**
     1.   define protected route component (HOC?)
     2.   define admin route component
     3.   add menu for admin in header
     4.   create dashboard screen component
27.  **Create Dashboard Screen UI**
     1.   create dashboard ui
     2.   implement backend api
     3.   connect ui to backend
28.  **Manage Products Screen**
     1.   create products list ui
     2.   implement backend api
     3.   fetch data
29.  **Create Product**
     1.   create 'create product' button
     2.   implement backend api
     3.   handle onClick
30.  **Update / Delete Product**
     1.   create edit button
     2.   create edit product UI
     3.   display product info in the input boxes
     4.   create edit product backend api
     5.   ProductEditScreen Form onSubmit submitHandler
     6.   upload photo functionality
          1.   create cloudinary account
          2.   store api key in .env file
          3.   backend npm install cloudinary
          4.   handle upload file
          5.   implement backend api to upload, uploadRoutes.js
     7. delete product functionality
        1. show delete buton ProductEditScreen
31.  **List Orders**
     1.   create OrderListScreen
          1.   NOTE: since only viewing data, not changing, no need to destructure the dispatch out from the store context, only state needed
     2.   implement order backend api
     3.   fetch and display orders
32.  **add functionality - deliver order**
     1.   add deliver button to OrderScreen for athenticated admin only
     2.   onClick handler
     3.   backend api for deliver
33.  **delete order**
     1.   implement delete-order functionality for authenticated admin only