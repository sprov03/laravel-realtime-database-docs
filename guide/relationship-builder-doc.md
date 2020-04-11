# Relationship Builder

Relationship builders allow you to simplify your migrations while following best practices
for mysql relationships, and when you generate the models they will be populated with all
of the relationships defined in the migration.

<iframe width="560" height="315" src="https://www.youtube.com/embed/HmC9MjyZQl0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Belongs To

``` php
<?php

use Akceli\Schema\Builders\AkceliRelationshipBuilder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Migrations\Migration;

/**
 *  Documentation: https://laravel.com/docs/5.8/migrations#creating-columns
 */
class CreateDogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('dogs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->integer('age');


            // if the owner has many dogs then use the whichHasManyOfTheses method
            // if the owner has one dog then use the whichHasOneOfTheses method
            AkceliRelationshipBuilder::table($table)
                ->belongsTo('owners')
                ->whichHasManyOfThese(); // or ->whichHasOneOfTheses()

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('dogs');
    }
}

```

## Belongs To Many

``` php
<?php

use Akceli\Schema\Builders\AkceliRelationshipBuilder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Migrations\Migration;

/**
 *  Documentation: https://laravel.com/docs/5.8/migrations#creating-columns
 */
class CreateDogWalkTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('dog_walk', function (Blueprint $table) {
            // this will add the required foriegn keys and setup the relationship
            // According to laravel conventions
            AkceliRelationshipBuilder::table($table)
                ->belongsToMany('dogs', 'walks');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('dog_walk');
    }
}

```

## Morph To

this is used for poly morphic relationships

``` php
<?php

use Akceli\Schema\Builders\AkceliRelationshipBuilder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Migrations\Migration;

/**
 *  Documentation: https://laravel.com/docs/5.8/migrations#creating-columns
 */
class CreateImagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('images', function (Blueprint $table) {
            $table->bigIncrements('id');

            // This will add the imageable relatoinship to the model when you generat it
            // and it will create an ImagableTrait and an ImagableInterface that you can 
            // implement and use on each imagable model to complete the setup.
            AkceliRelationshipBuilder::table($table)
                ->morphTo('imageable')->whichHasManyOfThese();

            $table->string('image_url');

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('images');
    }
}

```
