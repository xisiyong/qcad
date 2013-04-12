// ***** AUTOGENERATED CODE, DO NOT EDIT *****
            // ***** This class is not copyable.
        
        #ifndef RECMASHAREDPOINTEROBJECT_H
        #define RECMASHAREDPOINTEROBJECT_H

        #include "ecmaapi_global.h"

        #include <QScriptEngine>
        #include <QScriptValue>
        #include <QScriptContextInfo>
        #include <QDebug>

        
                #include "RObject.h"
            
            typedef QSharedPointer<RObject> RObjectPointer;
        

        /**
         * \ingroup scripting_ecmaapi
         */
        class QCADECMAAPI_EXPORT REcmaSharedPointerObject {

        public:
      static  void init(QScriptEngine& engine, QScriptValue* proto 
    =NULL
    ) 
    ;static  QScriptValue create(QScriptContext* context, QScriptEngine* engine) 
    ;

    // conversion functions for base classes:
    

    // returns class name:
    static  QScriptValue getClassName(QScriptContext *context, QScriptEngine *engine) 
        ;

    // returns all base classes (in case of multiple inheritance):
    static  QScriptValue getBaseClasses(QScriptContext *context, QScriptEngine *engine) 
        ;

    // properties:
    

    // public methods:
    static  QScriptValue
        init
        (QScriptContext* context, QScriptEngine* engine) 
        ;static  QScriptValue
        clone
        (QScriptContext* context, QScriptEngine* engine) 
        ;static  QScriptValue
        getDocument
        (QScriptContext* context, QScriptEngine* engine) 
        ;static  QScriptValue
        setDocument
        (QScriptContext* context, QScriptEngine* engine) 
        ;static  QScriptValue
        getId
        (QScriptContext* context, QScriptEngine* engine) 
        ;static  QScriptValue
        getHandle
        (QScriptContext* context, QScriptEngine* engine) 
        ;static  QScriptValue
        isUndone
        (QScriptContext* context, QScriptEngine* engine) 
        ;static  QScriptValue
        setUndone
        (QScriptContext* context, QScriptEngine* engine) 
        ;static  QScriptValue
        getPropertyTypeIds
        (QScriptContext* context, QScriptEngine* engine) 
        ;static  QScriptValue
        getProperty
        (QScriptContext* context, QScriptEngine* engine) 
        ;static  QScriptValue
        setProperty
        (QScriptContext* context, QScriptEngine* engine) 
        ;static  QScriptValue
        hasPropertyType
        (QScriptContext* context, QScriptEngine* engine) 
        ;static  QScriptValue
        isSelectedForPropertyEditing
        (QScriptContext* context, QScriptEngine* engine) 
        ;static  QScriptValue
        getCustomProperty
        (QScriptContext* context, QScriptEngine* engine) 
        ;static  QScriptValue
        setCustomProperty
        (QScriptContext* context, QScriptEngine* engine) 
        ;static  QScriptValue
        removeCustomProperty
        (QScriptContext* context, QScriptEngine* engine) 
        ;static  QScriptValue
        getCustomProperties
        (QScriptContext* context, QScriptEngine* engine) 
        ;static  QScriptValue
        getComplexity
        (QScriptContext* context, QScriptEngine* engine) 
        ;static  QScriptValue toString
    (QScriptContext *context, QScriptEngine *engine)
    ;static  QScriptValue destroy(QScriptContext *context, QScriptEngine *engine)
    ;static RObject* getSelf(const QString& fName, QScriptContext* context)
    ;static RObject* getSelfShell(const QString& fName, QScriptContext* context)
    ;static  QScriptValue data
    (QScriptContext *context, QScriptEngine *engine)
    ;static  QScriptValue isNull
    (QScriptContext *context, QScriptEngine *engine)
    ;static  QScriptValue toScriptValueEnumXYZ(QScriptEngine* engine, const RObject::XYZ& value)
    ;static  void fromScriptValueEnumXYZ(const QScriptValue& value, RObject::XYZ& out)
    ;};
    #endif
    