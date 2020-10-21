## 每个view根目录下必须有一个 route.json

```
{
  id: string, // 唯一标识
  name?: string, // 路由名称
  path: string, // url路径
  order?: number, // 排序
  exact?: boolean, // 是否完全匹配路径（默认false）
  enable?: boolean, // 是否启用（默认false）
  auth?: boolean // 是否需要登录才能访问（默认false）
}
```
