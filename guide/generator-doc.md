# Generators

The generators consist of 5 methods that allows you to interact with the person running the command. You can remind them of standards,
display links to documentation sites, or anything that you can think of that would be good to communicate about the command you
are currently running, in order to speed up your development in the future.

## requiresTable()

This method is used to determine if Akceli should try to build a collection of Columns to attach to the TemplateData.  This is heavily used
in crud based templates.


### ModelGenerator

``` php
<?php

namespace Akceli\Generators;

use Akceli\Akceli;
use Akceli\Console;

class ModelGenerator extends AkceliGenerator
{
    public function requiresTable(): bool
    {
        return true;
    }

    public function dataPrompter(): array
    {
        return [
        ];
    }

    public function templates(): array
    {
        return [
            Akceli::fileTemplate('model', 'app/Models/[[ModelName]].php'),
            Akceli::fileTemplate('model_test', 'tests/Models/[[ModelName]]Test.php'),
            Akceli::fileTemplate('model_factory', 'database/factories/[[ModelName]]Factory.php'),
        ];
    }

    public function inlineTemplates(): array
    {
        return [
            // Akceli::inlineTemplate('template_name', 'destination_path', 'identifier string')
        ];
    }

    public function completionMessage(): void
    {
        Console::info('Success');
    }
}

```

### ModelTemplate  (model.akceli.php)

``` php
<?php echo '<?php' . PHP_EOL;
/** @var  TemplateData $table */
use Akceli\TemplateData;
?>

namespace <?=$table->namespace?>;

use \Illuminate\Database\Eloquent\Model;
<?php if ($table->hasField('deleted_at')): ?>
use Illuminate\Database\Eloquent\SoftDeletes;
<?php endif; ?>
use Carbon\Carbon;

/**
 * Class <?=$table->ModelName . PHP_EOL?>
 *
 * Database Fields
<?php foreach ($table->columns as $column): ?>
 * @property <?=$column->getColumnSetting('php_class_doc_type', 'string')?> $<?=$column->getField() . PHP_EOL?>
<?php endforeach; ?>
 *
 * Relationships
 *
 * @package App\Models
 */
class <?=$table->ModelName?> extends Model
{
<?php if ($table->hasField('deleted_at')): ?>
    use SoftDeletes;

<?php endif; ?>
    protected $table = '<?=$table->table_name?>';

<?php if ($table->missingField('updated_at') && ! $table->hasField('created_at')): ?>
    public $timestamps = false;
<?php endif; ?>
<?php if ($table->primaryKey !== 'id'): ?>
    public $incrementing = false;
    protected $primaryKey = '<?=$table->primaryKey?>';

<?php endif; ?>
    protected $casts = [
<?php foreach ($table->columns as $column): ?>
<?php if ($column->getColumnSetting('casts')): ?>
        '<?=$column->getField()?>' => '<?=$column->getColumnSetting('casts')?>',
<?php endif; ?>
<?php endforeach; ?>
    ];

    protected $fillable = [
<?php foreach ($table->columns as $column): ?>
        //'<?=$column->getField()?>',
<?php endforeach; ?>
    ];
}


```


## dataPrompter()

The data prompter allows you to gather information about the specifics of a situation, before generating code.  The
base MigrationGenerator dose a good job of showcasing the power of this method.  All the data gathered here is available in the templates.

### Migration Generator
``` php
<?php

namespace Akceli\Generators;

use Akceli\Akceli;
use Akceli\Console;
use Illuminate\Support\Str;

class MigrationGenerator extends AkceliGenerator
{
    public function requiresTable(): bool
    {
        return false;
    }

    public function dataPrompter(): array
    {
        return [
            'migration_timestamp' => function() {
                return now()->format('Y_m_d_u');
            },
            'migration_name' => function() {
                $response = Console::ask('What is the name of the migration?');
                return Str::snake(str_replace(' ', '_', $response));
            },
            'migration_type' => function() {
                return Console::choice('Is this a create or update migration?', ['create', 'update'], 'create');
            },
            'table_name' => function() {
                return Console::ask('What is the name of the table being used in the migration?');
            }
        ];
    }

    public function templates(): array
    {
        return [
            Akceli::fileTemplate('migration', 'database/migrations/[[migration_timestamp]]_[[migration_name]].php')
        ];
    }

    public function inlineTemplates(): array
    {
        return [
            // Akceli::inlineTemplate('template_name', 'destination_path', 'identifier string')
        ];
    }

    public function completionMessage(): void
    {
        Console::info('Success');
    }
}

```

### Migration Template (migration.akceli.php)

``` php
<?php echo '<?php' . PHP_EOL;
/**
 * @var $migration_timestamp
 * @var $migration_name
 * @var $migration_type
 * @var $table_name
 */

use Illuminate\Support\Str; ?>

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Migrations\Migration;

/**
 *  Documentation: https://laravel.com/docs/5.8/migrations#creating-columns
 */
class <?=Str::studly($migration_name)?> extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
<?php if ($migration_type === 'create'): ?>
        Schema::create('<?=$table_name?>', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->softDeletes();
            $table->timestamps();
        });
<?php else: ?>
        Schema::table('<?=$table_name?>', function (Blueprint $table) {

        });
<?php endif; ?>
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
<?php if ($migration_type === 'create'): ?>
        Schema::drop('<?=$table_name?>');
<?php else: ?>
        Schema::table('<?=$table_name?>', function (Blueprint $table) {
        });
<?php endif; ?>
    }
}

```

## templates()
This method allows you to pick as many files as you want to generate with a single command, and decide where they should be placed.

### Api Controller Generator

``` php
<?php

namespace Akceli\Generators;

use Akceli\Akceli;
use Akceli\Console;

class ApiControllerGenerator extends AkceliGenerator
{
    public function requiresTable(): bool
    {
        return true;
    }

    public function dataPrompter(): array
    {
        return [];
    }

    public function templates(): array
    {
        return [
            Akceli::fileTemplate('api_controller', 'app/Http/Controllers/Api/[[ModelName]]Controller.php'),
            Akceli::fileTemplate('api_controller_test', 'tests/Http/Controllers/Api/[[ModelName]]ControllerTest.php'),
            Akceli::fileTemplate('create_model_request', 'app/Http/Requests/Store[[ModelName]]Request.php'),
            Akceli::fileTemplate('patch_model_request', 'app/Http/Requests/Update[[ModelName]]Request.php"'),
        ];
    }

    public function inlineTemplates(): array
    {
        return [
            // Akceli::inlineTemplate('template_name', 'destination_path', 'identifier string')
        ];
    }

    public function completionMessage(): void
    {
        Console::info('Success');
    }
}

```

## inlineTemplates()

This method allows to you insert a snippet of code into another file.  The NewAkceliGenerator makes use of this feature
to register the newly created Generator within ```config/akceli.php```.  It imports the new file and adds it to the template-groups array.

### New Akceli Generator
``` php
<?php

namespace Akceli\Generators;

use Akceli\Akceli;
use Akceli\Console;

class NewAkceliGenerator extends AkceliGenerator
{
    public function requiresTable(): bool
    {
        return false;
    }

    public function dataPrompter(): array
    {
        return [
            'GeneratorName' => function() {
                return Console::ask('What is the name of the new Generator?');
            },

            /**
             * Used in the import Template
             */
            'ImportNamespace' => function(array $data) {
                $generatorName = $data['GeneratorName'];
                return 'Akceli\Generators\\' . $generatorName . 'Generator';
            }
        ];
    }

    public function templates(): array
    {
        return [
            Akceli::fileTemplate('akceli_generator', 'akceli/generators/[[GeneratorName]]Generator.php'),
        ];
    }

    public function inlineTemplates(): array
    {
        return [
            Akceli::inlineTemplate(
                'akceli_generator_register',
                'config/akceli.php',
                '        /** New Generators Get Inserted Here */'
            ),
             Akceli::inlineTemplate(
                 'import',
                 'config/akceli.php',
                 '/** auto import new commands */'
             )
        ];
    }

    public function completionMessage()
    {
        Console::info('You have successfully created the new Akceli Migration');
    }
}

```

``` php
<?php /** @noinspection PhpUndefinedClassInspection */

use Akceli\Akceli;
use Akceli\Generators\NewAkceliGenerator;
use Akceli\Generators\ChannelGenerator;
use Akceli\Generators\CommandGenerator;
use Akceli\Generators\ControllerGenerator;
use Akceli\Generators\EventGenerator;
use Akceli\Generators\ExceptionGenerator;
use Akceli\Generators\FactoryGenerator;
use Akceli\Generators\JobGenerator;
use Akceli\Generators\ListenerGenerator;
use Akceli\Generators\MailableGenerator;
use Akceli\Generators\MiddlewareGenerator;
use Akceli\Generators\MigrationGenerator;
use Akceli\Generators\ModelGenerator;
use Akceli\Generators\NotificationGenerator;
use Akceli\Generators\ObserverGenerator;
use Akceli\Generators\PolicyGenerator;
use Akceli\Generators\ProviderGenerator;
use Akceli\Generators\RequestGenerator;
use Akceli\Generators\ResourceGenerator;
use Akceli\Generators\RuleGenerator;
use Akceli\Generators\TestGenerator;
use Akceli\Generators\ApiControllerGenerator;
use Akceli\Generators\ServiceGenerator;
use Akceli\Generators\SeederGenerator;
/** auto import new commands */

/**
 * Since Akceli is a dev only dependency I would keep this check here just to keep it form being active in production
 */
if (env('APP_ENV') !== 'local') {
    return [];
}

return [
    /**
     * Options: 'auto-complete' or 'multiple-choice'
     * will default to 'multiple-choice' if this is missing or set to an invalid option
     *
     * This controls how you chose your templates.
     * (auto-complete): Is useful if you know what templates you have, you can just type the first few letters
     *      of the template name and when it is selected just press enter.  When you do not know what your options are
     *      you can simply press enter with nothing selected and it will switch to multiple-choice selection allowing
     *      for you to see the full lis of templates you want.
     */
    'select-template-behavior' => 'auto-complete',

    /**
     * This is for documenting what values you want to be show based on a given data type.
     */
    'column-settings' => [
        /**
         * Usage: <?=$column->getColumnSetting('php_class_doc_type', 'string')?>
         *
         * Outputs based on column analysis:
         *    Integer: 'integer'
         *    String: 'string'
         *    Enum: 'string'
         *    Timestamp: 'Carbon'
         *    Boolean: 'boolean'
         */
        'php_class_doc_type' => Akceli::columnSetting('string', 'integer', 'string', 'string', 'Carbon', 'boolean'),

        /**
         * Usage: <?=$column->getColumnSetting('casts', 'string')?>
         *
         * Outputs based on column analysis:
         *    Integer: null
         *    String: null
         *    Enum: null
         *    Timestamp: 'datetime'
         *    Boolean: 'boolean'
         */
        'casts' => Akceli::columnSetting(null, null, null, null, 'datetime', 'boolean'),
    ],

    /**
     * This is where all the magic happens!!
     *
     * To make a new command: php artisan akceli new-command
     * It will register the command in the following list for you and build out the boiler plate of the command class.
     */
    'template-groups' => [
        'new-command' => NewAkceliGenerator::class,
        'channel' => ChannelGenerator::class,
        'command' => CommandGenerator::class,
        'controller' => ControllerGenerator::class,
        'api_controller' => ApiControllerGenerator::class,
        'event' => EventGenerator::class,
        'exception' => ExceptionGenerator::class,
        'factory' => FactoryGenerator::class,
        'job' => JobGenerator::class,
        'listener' => ListenerGenerator::class,
        'mailable' => MailableGenerator::class,
        'middleware' => MiddlewareGenerator::class,
        'migration' => MigrationGenerator::class,
        'model' => ModelGenerator::class,
        'notification' => NotificationGenerator::class,
        'observer' => ObserverGenerator::class,
        'policy' => PolicyGenerator::class,
        'provider' => ProviderGenerator::class,
        'request' => RequestGenerator::class,
        'resource' => ResourceGenerator::class,
        'rule' => RuleGenerator::class,
        'test' => TestGenerator::class,
        'service' => ServiceGenerator::class,
        'seeder' => SeederGenerator::class,
        /** New Generators Get Inserted Here */
    ],
];

```

## completionMessage()

This is here to allow you to add reminders about things that should not be forgotten.  The base EventGenerator makes good use of this method.

### Event Generator
``` php
<?php

namespace Akceli\Generators;

use Akceli\Akceli;
use Akceli\Console;

class EventGenerator extends AkceliGenerator
{
    public function requiresTable(): bool
    {
        return false;
    }

    public function dataPrompter(): array
    {
        return [
            'Event' => function () {
                return Console::ask('What is the name of the event?');
            }
        ];
    }

    public function templates(): array
    {
        return [
            Akceli::fileTemplate('event', 'app/Events/[[Event]]Event.php'),
            Akceli::fileTemplate('event_test', 'tests/Events/[[Event]]EventTest.php')
        ];
    }

    public function inlineTemplates(): array
    {
        return [
            // Akceli::inlineTemplate('template_name', 'destination_path', 'identifier string')
        ];
    }

    public function completionMessage(): void
    {
        Console::alert('Dont forget to register the Event in app/Providers/EventServiceProvider.php');
        Console::warn('Documentation: https://laravel.com/docs/5.8/events#registering-events-and-listeners');
    }
}

```