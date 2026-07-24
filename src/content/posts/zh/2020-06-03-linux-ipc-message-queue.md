---
title: "Linux IPC机制之消息队列"
slug: "2020-06-03-linux-ipc-message-queue"
description: "本文总结了Linux应用层提供的IPC机制之消息队列的概念性知识，以及使用消息队列进行应用层编程的例子。"
date: 2020-06-03T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Linux"]
tags: ["Linux"]
draft: false
---


## **消息队列基础**

- Linux系统中的消息队列机制是SystemV IPC提供的三大进程间IPC机制之一：消息队列，信号量，共享内存；
- Linux内核中会为每个IPC结构（包括消息队列、信号量和共享内存等）都使用一个非负整数的标识符来加以引用，而无论何时创建或者使用一个已经存在于内核中的IPC结构，都需要指定一个关键字（key_t），使用这个关键字对不同的IPC结构进行区分；
- 消息队列中每一个消息都需要遵守系统的：消息最大长度限制MSGMAX，每个消息队列的总的字节数限制MSGMNB，系统上消息队列的总数限制MSGMNI。
    - 可以进入/proc/sys/kernel/查看具体的限制数据；
- 在Linux中可以使用ipcs命令来查看系统内核中存在的消息队列的状态以及统计数据；

## **消息队列的工作原理**


从本质上讲，消息队列实际上就是位于内核空间的链表。应用空间定义和声明的一个消息队列实际上会对应内核空间的一组（多个）链表，用户层收发的每一条消息都对应于链表中的一个节点，具有相同消息类型的消息节点按照写入的顺序通过指针链接在一起，因此每一个消息类型都对应有一个链表。


应用层对于消息队列的发送和接收从本质上来讲，都是基于其中的某个链表，而非整个消息队列。


内核中消息队列的数据结构的原理如下图所示：


![Untitled.png](/images/blog/Linux-IPC机制之消息队列-1.png)

- 消息类型的ID用一个整数来表示，而且这个ID必须大于0，每个消息类型都有一个属于自己的链表；
- 应用层发出和接收消息必须要指定一个消息类型ID，这样内核才能知道把这个消息放入哪个链表，或者从哪个链表上取出数据；
- 消息类型ID为0的节点用于记录整个消息队列中所有消息加入消息队列的顺序，即上图用红色线条标注的链条；
    - 在应用中如果我们需要按照顺序读取整个消息队列中的所有消息，即要求消息队列中无论消息类型的ID是多少都返回的时候，就可以在读取的时候指定读取的消息类型ID为0，这样就会把整个消息队列的所有消息全部按照顺序返回；

## **消息队列的主要API**


**ftok函数**

- 用于基于参数生成一个消息队列的key，其原型为：
    - key_t ftok(const char *pathname, int proj_id);
- 参数：
    - pathname：存在于文件系统的某个文件或者目录的路径名称，可以随意设置，但是这个路径名称对应的文件/目录必须存在；
    - proj_id：根据自己的约定随意设置，Unix系统中取值范围为0-255；
- 功能：ftok函数根据参数传递的路径名，提取出该路径下文件inode在系统内的信息，根据这些文件信息与参数传递的project ID合成一个独一无二的消息队列key；

**msgget函数**

- 用于创建/访问一个消息队列，其原型为：
    - int msgget(key_t key, int msgflag);
- 参数：
    - key：消息队列的key，一般使用ftok()产生；
    - msgflag：有两个选项，IPC_CREAT和IPC_EXCL；
    - 单独使用IPC_CREAT：消息队列不存在的话就创建消息队列，存在的话就打开返回；
    - 使用IPC_CREAT | IPC_EXCL：消息队列不存在的话就创建消息队列，存在的话就出错返回；
- 返回值：
    - 如果执行成功就返回一个非负整数，表示这个消息队列的ID，后续收发消息对需要引用这个消息队列ID；如果执行失败则返回-1；

**msgctl函数**

- 用于控制和设置消息队列，其原型为：
    - int msgctl(int msqid, int cmd, struct msqid_ds *buf);
- 参数：
    - msqid：由以上msgget函数执行返回的消息队列的ID；
    - cmd：有三个选项，IPC_STAT，IPC_SET，IPC_RMID；
    - IPC_STAT：获取消息队列的内部属性信息数据（uid，gid，字节数，消息数等），赋值给参数传递的msqid_ds结构中；
    - IPC_SET：使用参数传递的设置msqid_ds结构数据设置消息队列中可以设置的属性信息；（需要足够的权限，并且只能设置可设置的部分）
    - IPC_RMID：删除消息队列；
- 返回值：
    - 执行成功返回0，失败返回-1；

**msgsnd函数：**

- 向消息队列发送一条消息，其原型为：
    - int msgsnd(int msqid, const void *msgp, size_t msgsz, int msgflg);
- 参数：
    - msqid：由以上msgget函数执行返回的消息队列的ID；
    - msgp：要发送的消息内容；
    - 消息内容的前sizeof(long int)个字节一定要是消息类型的ID，否则内核收到这个消息以后不知道应该放到哪个链表上进行处理；
    - msgsz：要发送的消息长度；
        - 这个消息长度应该减去消息类型ID的长度，即sizeof(long int)；
    - msgflag：
        - 默认为0，表示消息队列满的时候阻塞等待；
        - 设置为IPC_NOWAIT，当消息队列满的时候直接返回错误；
- 返回值：
    - 执行成功返回0，失败返回-1；
- 注意事项：
    - 发出消息的大小必须要小于系统规定的上限，即MSGMAX参数；
    - 消息结构体必须要以一个long int长整型开始，内核根据消息的这个值来判断应该放入哪个链表，而消息的接收者也根据这个值来确定要接收的消息的类型；

**msgrcv函数**

- 用于从消息队列中接收消息，其原型为：
    - ssize_t msgrcv(int msqid, void *msgp, size_t msgsz, long msgtyp, int msgflg);
- 参数：
    - msqid：由以上msgget函数执行返回的消息队列的ID；
    - msgp：接收到的消息头指针；
    - msgsz：接收到的消息的长度；
    - msgtyp：指定要接收的消息的消息类型；
        - msgtyp = 0：表示获取整个消息队列中的第一条消息，实际上反复的读取msgtyp = 0的消息，会把整个消息队列的消息按照顺序读取出来，不依赖于具体的消息类型；
        - msgtyp > 0：表示获取类型为 msgtyp 的第一条消息，除非指定了 msgflg 为MSG_EXCEPT，这表示获取除了 msgtyp 类型以外的第一条消息。
        - 可以结合上面的消息队列链表结构来对以上内容进行理解。
    - msgflag：
        - 默认为0，表示消息队列中没有指定消息类型的消息的时候，阻塞等待；
        - 设置为IPC_NOWAIT，当消息队列中没有指定消息类型的消息时直接返回错误；
- 返回值：
    - 执行成功则返回实际接收到接收缓冲区里的字符个数，失败返回-1；

## **示例代码**


这里设计一个比较典型的消息队列通信的案例：可以支持向同一个消息队列的不同消息类型链表发送不同消息内容的消息，并能够正确的接收和解析；

- 创建一个消息队列，send进程向该详细队列中写入消息，recv进程从消息队列中读取消息；
- send进程一次执行向消息队列的不同消息类型发送消息；
- 相当于是向一个消息队列的多个链表分别发送消息；
- send进程一次执行向消息队列的同一消息类型发送不同的消息内容；
- 相当于是向一个消息队列的同一个消息链表写入类型不同的消息数据；

msg.h：


```c
#ifndef _MSG_H_
#define _MSG_H_

#define msg_file_path "/home/embedded/pavelhan"
#define msg_project_id 'H'

typedef struct {
    unsigned int cmd;
    char name[20];
    int age;
}Person;

typedef struct {
    unsigned int cmd;
    int age;
    char name[20];
}Dog;

typedef struct {
    long type;
    Person person;
}Person_Msg;

typedef struct {
    long type;
    Dog dog;
}Dog_Msg;

#endif
```


send.c：


```c
#include <unistd.h>
#include <sys/ipc.h>
#include <sys/msg.h>
#include <stdio.h>
#include <stdlib.h>

#include "msg.h"

void printPersonMsg(Person_Msg *msg) {
    printf("{ cmd = %ld, name = %s, age = %d }\n",
           msg->person.cmd, msg->person.name, msg->person.age);
}

void printDogMsg(Dog_Msg *msg) {
    printf("{ cmd = %ld, name = %s, age = %d }\n",
           msg->dog.cmd, msg->dog.name, msg->dog.age);
}

int main(int argc, char *argv) {
    key_t msq_key = ftok(msg_file_path,msg_project_id);
    printf("msg queue key:%x\n", msq_key);

    int msq_id = msgget(msq_key, IPC_CREAT | 0664);
    if(msq_id<0){
        perror("Create msg queue failed\n");
        exit(-1);
    }

    Person_Msg person_msg[10] = {
        {1, {1, "Luffy", 17}},
        {1, {1, "Zoro", 19}},
        {2, {1, "ami", 18}},
        {2, {1, "Usopo", 17}},
        {1, {1, "Sanji", 19}},
        {3, {1, "Chopper", 15}},
        {4, {1, "Robin", 28}},
        {4, {1, "Franky", 34}},
        {5, {1, "Brook", 88}},
        {6, {1, "Sunny", 2}}
    };
    
    Dog_Msg dog_msg[10] = {
        {1, {2, 2, "hhh"}},
        {1, {2, 3, "zzz"}},
        {2, {2, 0, "aaa"}},
        {2, {2, 1, "Uuuu"}},
        {1, {2, 2, "Sss"}},
        {3, {2, 5, "Cccc"}},
        {4, {2, 6, "Rrrr"}},
        {4, {2, 3, "Ffff"}},
        {5, {2, 2, "Bbb"}},
        {6, {2, 3, "Ssss"}}
    };

    int i;
    for (i = 0; i < 10; ++i) {
        int res = msgsnd(msq_id, &person_msg[i], sizeof(unsigned int)+sizeof(Person), 0);
        if(res>=0){
            printPersonMsg(&person_msg[i]);
        }
    }

    for (i = 0; i < 10; ++i) {
        int res = msgsnd(msq_id, &dog_msg[i], sizeof(unsigned int)+sizeof(Dog), 0);
        if(res>=0){
            printDogMsg(&dog_msg[i]);
        }
    }
    
    return 0;
}
```


recv.c：


```c
#include <unistd.h>
#include <sys/types.h>
#include <sys/ipc.h>
#include <sys/msg.h>
#include <stdio.h>
#include <stdlib.h>
#include <errno.h>

#include "msg.h"

void printPersonMsg(Person_Msg *msg) {
    printf("{ cmd = %ld, name = %s, age = %d }\n",
           msg->person.cmd, msg->person.name, msg->person.age);
}

void printDogMsg(Dog_Msg *msg) {
    printf("{ cmd = %ld, name = %s, age = %d }\n",
           msg->dog.cmd, msg->dog.name, msg->dog.age);
}

unsigned char msg_buf[4096];

int main(int argc, char *argv[]) {
    int flag;

    if (argc < 2) {
        printf("usage: %s <type>\n", argv[0]);
        return -1;
    }
    
    // 要获取的消息类型
    long type = atol(argv[1]);
    
    key_t msq_key = ftok(msg_file_path,msg_project_id);
    printf("msg queue key:%x\n", msq_key);

    int id = msgget(msq_key, IPC_CREAT | 0664);
    if(id<0){
        perror("Create msg queue failed\n");
        exit(-1);
    }
    
    system("ipcs -q") ;
    
    int res;    
    while(1) {
        // 以非阻塞的方式接收类型为 type 的消息
        res = msgrcv(id, msg_buf, sizeof(msg_buf), type, IPC_NOWAIT);
        if (res < 0) {
            // 如果消息接收完毕就退出，否则报错并退出
            if (errno == ENOMSG) {
                printf("No message!\n");
                break;
            }
        }
        // 打印消息内容
        unsigned int cmd;
        cmd=*(unsigned int *)(msg_buf+sizeof(long));
        if(cmd==1){
            Person_Msg * person_msg;
            person_msg=(Person_Msg *)msg_buf;
            printPersonMsg(person_msg);
        }
        else if(cmd==2){
            Dog_Msg * dog_msg;
            dog_msg=(Dog_Msg *)msg_buf;
            printDogMsg(dog_msg);
        }
    }

    flag = msgctl(id, IPC_RMID,NULL) ;
    if ( flag < 0 ){
        perror("rm message queue error") ;
        return -1 ;
    }
    system("ipcs -q") ;
    return 0;
}
```


通过send进程发出消息后，读取消息类型为1的所有消息：


```bash
[embedded@localhost msg]$ ./send
msg queue key:48023d82
{ cmd = 1, name = Luffy, age = 17 }
{ cmd = 1, name = Zoro, age = 19 }
{ cmd = 1, name = ami, age = 18 }
{ cmd = 1, name = Usopo, age = 17 }
{ cmd = 1, name = Sanji, age = 19 }
{ cmd = 1, name = Chopper, age = 15 }
{ cmd = 1, name = Robin, age = 28 }
{ cmd = 1, name = Franky, age = 34 }
{ cmd = 1, name = Brook, age = 88 }
{ cmd = 1, name = Sunny, age = 2 }
{ cmd = 2, name = hhh, age = 2 }
{ cmd = 2, name = zzz, age = 3 }
{ cmd = 2, name = aaa, age = 0 }
{ cmd = 2, name = Uuuu, age = 1 }
{ cmd = 2, name = Sss, age = 2 }
{ cmd = 2, name = Cccc, age = 5 }
{ cmd = 2, name = Rrrr, age = 6 }
{ cmd = 2, name = Ffff, age = 3 }
{ cmd = 2, name = Bbb, age = 2 }
{ cmd = 2, name = Ssss, age = 3 }
[embedded@localhost msg]$ ./recv 1
msg queue key:48023d82


--------- 消息队列 -----------
键        msqid      拥有者  权限     已用字节数 消息      
0xffffffff 0          embedded   664        224          7           
0x48023d82 393217     embedded   664        640          20          


{ cmd = 1, name = Luffy, age = 17 }
{ cmd = 1, name = Zoro, age = 19 }
{ cmd = 1, name = Sanji, age = 19 }
{ cmd = 2, name = hhh, age = 2 }
{ cmd = 2, name = zzz, age = 3 }
{ cmd = 2, name = Sss, age = 2 }
No message!


--------- 消息队列 -----------
键        msqid      拥有者  权限     已用字节数 消息      
0xffffffff 0          embedded   664        224          7
```


通过send进程发出消息后，读取整个消息队列中的所有消息（无论消息类型是多少）：


```bash
[embedded@localhost msg]$ ./send
msg queue key:48023d82
{ cmd = 1, name = Luffy, age = 17 }
{ cmd = 1, name = Zoro, age = 19 }
{ cmd = 1, name = ami, age = 18 }
{ cmd = 1, name = Usopo, age = 17 }
{ cmd = 1, name = Sanji, age = 19 }
{ cmd = 1, name = Chopper, age = 15 }
{ cmd = 1, name = Robin, age = 28 }
{ cmd = 1, name = Franky, age = 34 }
{ cmd = 1, name = Brook, age = 88 }
{ cmd = 1, name = Sunny, age = 2 }
{ cmd = 2, name = hhh, age = 2 }
{ cmd = 2, name = zzz, age = 3 }
{ cmd = 2, name = aaa, age = 0 }
{ cmd = 2, name = Uuuu, age = 1 }
{ cmd = 2, name = Sss, age = 2 }
{ cmd = 2, name = Cccc, age = 5 }
{ cmd = 2, name = Rrrr, age = 6 }
{ cmd = 2, name = Ffff, age = 3 }
{ cmd = 2, name = Bbb, age = 2 }
{ cmd = 2, name = Ssss, age = 3 }
[embedded@localhost msg]$ ./recv 0
msg queue key:48023d82


--------- 消息队列 -----------
键        msqid      拥有者  权限     已用字节数 消息      
0xffffffff 0          embedded   664        224          7           
0x48023d82 425985     embedded   664        640          20          


{ cmd = 1, name = Luffy, age = 17 }
{ cmd = 1, name = Zoro, age = 19 }
{ cmd = 1, name = ami, age = 18 }
{ cmd = 1, name = Usopo, age = 17 }
{ cmd = 1, name = Sanji, age = 19 }
{ cmd = 1, name = Chopper, age = 15 }
{ cmd = 1, name = Robin, age = 28 }
{ cmd = 1, name = Franky, age = 34 }
{ cmd = 1, name = Brook, age = 88 }
{ cmd = 1, name = Sunny, age = 2 }
{ cmd = 2, name = hhh, age = 2 }
{ cmd = 2, name = zzz, age = 3 }
{ cmd = 2, name = aaa, age = 0 }
{ cmd = 2, name = Uuuu, age = 1 }
{ cmd = 2, name = Sss, age = 2 }
{ cmd = 2, name = Cccc, age = 5 }
{ cmd = 2, name = Rrrr, age = 6 }
{ cmd = 2, name = Ffff, age = 3 }
{ cmd = 2, name = Bbb, age = 2 }
{ cmd = 2, name = Ssss, age = 3 }
No message!


--------- 消息队列 -----------
键        msqid      拥有者  权限     已用字节数 消息      
0xffffffff 0          embedded   664        224          7
```


## **对于Linux应用层的多模块应用程序中使用消息队列的一些思考**

- 多模块应用程序一般从架构上可以分为一个主模块和多个子模块，应用启动过程中首先启动主模块，主模块根据配置或者启动参数决定启动各个子模块；
    - 主模块在退出时也需要负责对所有的消息队列做删除操作，避免下次启动造成状态混乱；
- 每个模块都有自己的独立的消息队列，所有的消息队列在主模块启动时创建，各个子模块启动后，把主模块和自己的消息队列通过msgget挂接进来；
    - 所有的子模块只会与主模块之间通过消息队列直接通信，不会给其他模块直接发送消息，消息通过主模块来进行总体的管理和中转，以降低子模块之间的耦合；
    - 因此对于每个子模块而言，只需要挂接自己的消息队列和主模块的消息队列；而对于主模块，因为有可能与所有的子模块通信，因此需要创建/挂接自己和所有子模块的消息队列；
- 所有的模块（包括主模块）都有一个专门用于接收和处理自己消息队列中信息的消息处理线程，在该线程中通过while循环+msgrcv阻塞接收的方式等待接收和处理发送给自己的消息，此处msgrcv函数应该使用msgtype=0的接收参数，这样就可以不加区分的接收和处理整个消息队列各个链表中的所有消息，收到消息后，再针对不同的消息类型做不同的处理逻辑；
- 所有的模块（包括主模块）在需要向其他模块发出消息时只需要调用msgsnd发送消息即可，在消息类型参数msgtype可以指定不同的消息类型id，来对不同的消息内容进行区分；
    - 如以上例子代码所示，不同消息类型可以包含不同的消息数据结构，但总的来讲，因为消息队列本身有总的字节数的限制，因此如果有比较大的数据，不建议使用消息队列直接传输，进程之间可以配合共享内存来对大块的数据结构进行传输，线程之间则可以通过全局数据结构来进行消息数据的传递；

## **参考资料**

- [【Linux】进程间通信之消息队列](https://blog.csdn.net/wei_cheng18/article/details/79661495)
- [Linux系统编程—消息队列](https://www.jianshu.com/p/7e3045cf1ab8)
