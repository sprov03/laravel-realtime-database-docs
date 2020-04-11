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
Require the composer package
```shell script
// TODO: Change this to be akceli/laravel-realtime-database
composer require akceli/realtime-client-store-sync
```

### Publish Assets
Publish the Akceli\RealtimeClientStoreSync\ServiceProvider
```bash
php artisan vendor:publish

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

// Dont forget include the Store api
\Akceli\RealtimeClientStoreSync\ClientStore\ClientStoreController::apiRoutes();

// Dont forget to add the middleware to the api routes
Route::middleware(['auth:api', 'client-store'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});


```

### Env
```dotenv
# Client Store
CLIENT_STORE_URL=v1/client_store
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
Each store will get its own file in the ClientStores Directory.  This can be modified in config/client-store.php
```php
File: app/ClientStores/AccountStore.php

<?php

namespace App\ClientStores;

use Akceli\RealtimeClientStoreSync\ClientStore\ClientStoreBase;
use App\Models\Account;
use App\Resources\AccountStoreAccountResource;

class AccountStore extends ClientStoreBase
{
    public static function accountProperty(int $account_id)
    {
        return self::single($account_id,
            Account::query()->where('id', '=', $account_id),
            AccountStoreAccountResource::class,
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
    use ClientStoreModelTrait;
    use Notifiable;

    public function getStoreProperties()
    {
        return [
            AccountStore::accountProperty($this->id),
        ];
    }


```

### Api Complete
Now all of your api changes will automatically update the client State if it applies the following middleware to all api call.  This can also be manually triggered, here (TODO: Add a link to the managment of queue flushing)

### install the client library
```shell
npm install laravel-realtime-databaes-vuex

```

#### Init the RealtimeDatabase
```js
File:  main.js

import RealtimeStore from "akceli-realtime-store-npm";
import Pusher from "pusher-js";

// store: is the Vuex Store that you pass to your Vue instance
RealtimeStore.init(Vue, store, new Pusher(process.env.MIX_PUSHER_APP_KEY, {cluster: 'us2', forceTLS: true}));

```

### Javascript code to handle the response
This will allow for any changes that are made during your requests to imediatly update the client store, instead of waiting for pusher to push the changes out.
```javascript
// Http Middle Ware
function http() {
  // This is just here for an example
  const httpInstance = axios.create({
    baseURL: process.env.MIX_BASE_API_URL,
    headers: {'Authorization': `Bearer ${LocalStorageService.getApiToken()}`}
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

```

#### Vuex Store
```js
import RealtimeStore from "akceli-realtime-store-npm";

//  Vue.js Mutations
const mutations = {
  ...RealtimeStore.channelMutations,
}

```

## Api Usage
This is how you can directly query the store if you need to.

```javascript
API:  client_store/{store}/{store_id}/{property}/{id}?page=2&size=5&offset=20&after=12&after_column=id
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
