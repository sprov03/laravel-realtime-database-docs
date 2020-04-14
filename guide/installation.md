# Installation

## Requirements
##### Laravel Requirements
* php > 7.0
* Laravel Framework 5.8+
* Composer

##### Javascript Requirements
currently the only package available for javascript is for Vue.  But you can create on
for any javascript framework, using the Vue package as a guide if you are using something other then Vue.
* vue 2.0

## Installation

####  Laravel Installation
Require the composer package and Publish the assets
```shell script
composer require akceli/laravel-realtime-database
php artisan vendor:publish --provider="Akceli\RealtimeClientStoreSync\ServiceProvider"

```

### Register the Middleware
    
```
File: app/Http/Kernel.php

    /**
     * The application's route middleware.
     *
     * These middleware may be assigned to groups or used individually.
     *
     * @var array
     */
    protected $routeMiddleware = [
        ...
        'client-store' => FlushClientStoreChangesMiddleware::class,
        ...
    ];
```

### Add the route to your routes file
```php
File: routes/api.php

Route::middleware(['auth:api'])->group(function () {
    // This registers the Client Store Endpoint
    Route::prefix('client-store')->group(function () {
        ClientStoreController::apiRoutes();
    });

    /**
     * All routes that will use the Client Store Middleware
     */
    Route::middleware('client-store')->group(function () {
        Route::get('/user', function (Request $request) {
            return $request->user();
        });
    });
});



```

### Env
```dotenv
# Client Store
CLIENT_STORE_URL=api/client-store
MIX_CLIENT_STORE_URL="${CLIENT_STORE_URL}"

```


### Add the testing api overrides
since the middleware sends client store changes along side the response
you will need to remove the client store changes for your tests.  Just use the and trait
and tests will continue to work as expected.
```
File: tests\TestCase.php

<?php

namespace Tests;

use Akceli\RealtimeClientStoreSync\Middleware\ClientStoreTestMiddlewareOverwrites;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;


    //  This is the trait you need to add
    use ClientStoreTestMiddlewareOverwrites;
}

```

### Setup Your Client Store
Each store will get its own file in the ClientStores Directory.  This can be modified in config/client-store.php if the directory is taken for something else already.
The following is provided during the publishing of the assets.  You dont need to register the stores, simply put them in the root fo the
ClientStores Directory and Have the Class End with Store and extend the ClientStoreBase Class.  This will create a users Store with a single property of users.
```php
File: app/ClientStores/UsersStore.php

<?php

namespace App\ClientStores;

use Akceli\RealtimeClientStoreSync\ClientStore\ClientStoreBase;
use App\Resources\UsersStoreUsersPropertyResource;
use App\User;

class UsersStore extends ClientStoreBase
{
    public static function usersProperty(int $user_id)
    {
        return self::single($user_id,
            User::query()->where('id', '=', $user_id),
            UsersStoreUsersPropertyResource::class
        );
    }
}
```


### Add the ClientStoreModel Trait to any model you with to track changes to
```
use App\ClientStore\ClientStoreModelTrait;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    /** Use the Client Store Trait */
    use ClientStoreModelTrait;

    /**
     * Define the client store propertyes that need to be updated when the model is updated.
     */
    public function getStoreProperties()
    {
        return [
            UsersStore::usersProperty($this->id),
        ];
    }


```

### Api Complete
Now all of your api changes will automatically update the client State if it applies the following middleware to all api call.  This can also be manually triggered, here (TODO: Add a link to the managment of queue flushing)

### install the client library
```shell
npm install laravel-realtime-database-vuex pusher-js vuex axios --save

or

yarn add laravel-realtime-database-vuex pusher-js vuex axios

```

#### Init the RealtimeDatabase
```js
File:  main.js

import Vuex from 'vuex';
import RealtimeStore from "laravel-realtime-database-vuex";
import Pusher from "pusher-js";

Vue.use(Vuex);
const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {},
  mutations: {
    ...RealtimeStore.channelMutations,
  }
});

RealtimeStore.init(Vue, store, new Pusher(process.env.MIX_PUSHER_APP_KEY, {cluster: 'us2', forceTLS: true}));

new Vue({
  store,
  render: h => h(App),
}).$mount('#app');


```

### Javascript code to handle the response
Create a http.js file and use this for all api calls.  This will allow you to apply middle ware throwout your app, Which
we need in order to immediately update the client store, instead of waiting for pusher to push the changes out.
```javascript
File: http.js

// Http Middle Ware
import axios from 'axios/index';
import RealtimeStore from "laravel-realtime-databaes-vuex";

function http() {
  const httpInstance = axios.create({
    baseURL: process.env.MIX_BASE_API_URL,
    //headers: {'Authorization': `Bearer ${LocalStorageService.getApiToken()}`}
  });
  
  httpInstance.interceptors.response.use(
    response => successHandler(response),
    error => errorHandler(error),
  );
  
  return httpInstance;
}

const successHandler = (response) => {
  response = RealtimeStore.apiSuccessMiddleware(response);
  
  return response;
};

const errorHandler = (error) => {
  error = RealtimeStore.apiErrorMiddleware(error);
  
  return Promise.reject({ ...error })
};

export default http;

```


## Direct Api Usage, only good for querying

```javascript
API:  api/client-store/{store}/{store_id}/{property}/{id}?page=2&size=5&offset=20&after=12&after_column=id
    * store: the client store
    * store_id:  the id of the store (channel_id)
    * property: property  (you can retrieve this info threw paginatino query)
    * id: can get a single instance in the collection

Query Parameters
  * size: page size used in each of the pagination types

  * page: standard pagination

  * offset: used to get the next page from this offset

  * after:  used to get the next page after this one
  * after_column: column used in the after
    
```
