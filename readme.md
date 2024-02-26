Converge framework core based on wasm (Zig lang)

### Articles about solid-js:
- https://dev.to/ryansolid/a-hands-on-introduction-to-fine-grained-reactivity-3ndf
- https://dev.to/ryansolid/building-a-reactive-library-from-scratch-1i0p
- https://dev.to/ryansolid/thinking-granular-how-is-solidjs-so-performant-4g37


# Architect 
- Идея заключается в том что есть такие сущности
    - Узел дерева.
    - Scope - где компоненты преодставлены как мапа с узлами
    - Контект - это множество скопов 
- регистрация компонентов в контексте, компоненты загружаются туда один раз.     
- При рендеринге происходит процесс работы с компонентами. 

# Элементы 
- Хранилище компонентов 
- Хранилище состояния 
- Экземпляры компонентов слинкованные.


# Части системы converged
- Reactive - сигналы
- Rendering - отрисовка компонентов
- Tasks - управление отрисовокой?
- Flow - контроль потока
- Routing - обработка 
- IO - взаимодействие с сервером
- Cap - сериализация 
