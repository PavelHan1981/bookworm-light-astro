---
title: "对Linux的UBI以及UBIFS文件系统的学习总结"
slug: "2024-10-25-the-UBI-and-UBIFS-Filesystem-On-Linux"
description: "通过两篇总结对Linux系统下UBI及其UBIFS文件系统的核心概念、使用流程、文件系统内容的存储结构进行完整的整理，为Linux下高效使用UBIFS文件系统打好理论方面的基础。"
date: 2024-10-25T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["嵌入式"]
tags: ["Linux"]
draft: false
---


以两篇笔记的篇幅整理一下在Linux系统中UBI以及UBIFS文件系统的概念，结构，应用中的流程以及使用中应注意的问题。


## UBI/UBIFS的概念及其在Linux文件系统中的层次架构


UBI：unsorted block images。


UBIFS


UBI是建立在Linux MTD闪存文件系统结构上的一个抽象层，其对于闪存的读写访问仍然要依赖于MTD层，但是又不是一个独立的可以直接给应用层使用的文件系统。UBI为了方便应用层文件系统对于闪存的高效使用，把闪存介质在使用中普遍存在的坏块管理、磨损平衡等方面的问题处理好，并通过逻辑存储块和物理存储块的映射，向其更上层通过逻辑存储块提供一个理想的存储空间管理接口。


而UBIFS则是一个基于UBI的文件系统，能够直接在应用层调用进行文件的创建和读写操作。UBIFS是基于UBI抽象层之上，也就是说UBIFS虽然是一种文件系统，但是并不像JFFS2、YAFFS这类文件系统一样直接工作在MTD块设备上，而是工作在UBI层所创建的一个卷（volume）上。


因此，UBI和UBIFS是相关但是完全不同的两个概念，UBI只是在传统的Linux针对闪存读写的MTD结构上的一个虚拟层，封装了部分闪存读写管理相关的通用问题解决方案，但是并不是一个可以直接提供给应用层访问的文件系统；而UBIFS则是在UBI的基础上，所实现的一个可以由用户空间访问的文件系统，UBIFS必须建立在UBI的基础之上。


因此，Linux上的MTD、各种不同类型的文件系统以及UBI/UBIFS之间的关系如下图所示：


![image.png](/images/blog/对Linux的UBI以及UBIFS文件系统的学习总结-1.png)

- MTD层提供了对底层闪存硬件的读写操作的通用接口。
- 在MTD层之上运行的UBI则提供了针对闪存器件尤其是NAND Flash操作的磨损平衡、坏块管理等处理，通过逻辑块和物理块映射的操作，为其更上层的文件系统层提供一个理想的存储访问介面。
- UBIFS则是基于UBI的一种文件系统，本身没有磨损平衡、坏块管理等方面的功能，因此不适合直接放在MTD层次上使用。UBIFS就是一个可以在用户空间访问的文件系统。

此外，UBI层上可以支持多个逻辑卷，也就是说一个UBI空间可以支持多个逻辑分区，每个逻辑分区都是一个独立的UBIFS文件系统。在UBI上的逻辑卷甚至可以支持动态创建删除以及动态调整各个逻辑卷大小的功能，这些都得益于UBI给上层文件系统提供了一个虚拟逻辑块组成的理想存储介面。


![image.png](/images/blog/对Linux的UBI以及UBIFS文件系统的学习总结-2.png)


## UBI Header


如上所述，UBI是基于MTD层所提供的底层闪存硬件标准化读写接口来实现的，那么在UBI层次上看到的就是MTD所提供的物理闪存块和闪存页。为了能够方便UBI层锁定的功能的实现，UBI在进行格式化的时候会向每个闪存块写入UBI Header来标记每个块的状态信息，例如这个Header中记录了这个块被擦除的次数，基于此了解到这个块的磨损状态，从而在后续执行磨损平衡的过程中始终保证所有的闪存块都得到大致相同的擦写次数，延长闪存的使用寿命。


在每个闪存Block头部写入的UBI Header主要是两个Header结构：EC Header（主要包含各个块的擦写次数）和VID Header（主要包含这个闪存块与UBI上逻辑卷之间的关系），每个Header结构都是64字节长度，每个Header占一个Page，这样的话在UBI格式化之后，每个闪存块的前两个Page分别用于保存EC Header和VID Header，实际数据部分从第三个闪存页开始，每个闪存块整体可用于存储实际数据的空间会比闪存块本身小两个page的大小。


![1729905954108.png](/images/blog/对Linux的UBI以及UBIFS文件系统的学习总结-3.png)


## UBI的运行状态表


除了UBI在Flash上的每个erase block的前两个存储页里面写入EC Header和VID Header信息以外，UBI的运行还要依赖于三张表：

- Volume Table，卷表，其中记录着在这个UBI空间上创建的所有卷的名字、类型、id、卷空间的大小、卷校验值等信息。Volume Table保存在Flash空间中，UBI驱动初始化的时候从Flash读出来。因为这个信息对于UBI的卷管理非常关键，为了应对在读写这个Volume Table的时候发生掉电的情况，在Flash上实际上保存着两份Volume Table，其中一份作为备份。这个Volume Table仅仅被UBI用于进行卷管理，在用户空间是看不到的。
- EC Table，也就是各个erase block的擦除计数表，记录了每个erase block的擦除计数，主要用于UBI执行Flash的磨损平衡算法。如前所示，因为每个Erase Block都会在第一个page写入自己的擦除次数信息，因此这个EC table实际上是UBI启动初始化的过程中，对所有的flash erase block进行扫描，读取每个block的擦除次数，统计在这个RAM中运行的EC table中，此后的磨损平衡算法依赖于这个EC Table选择合适的erase block写入新数据。
- Erase Block Associate Table，逻辑内存块和物理内存块的映射关系表。类似于EC Table，这个表同样是基于Flash各个Block中记录的UBI VID Header信息解析出来的，运行在RAM中。

总结起来，在UBI的正常运行所需要的三张表中，Volume Table是记录在Flash中的，初始化的时候从Flash中读出即可；而EC Table和Erase Block Associate Table这两张表都是在UBI驱动初始化时从Flash的所有Erase block中读取EC Header和VID Header信息，通过对这些信息解析出来的。


## UBI工具：Ubiformat/Ubiattach/Ubimkvol


正是因为包含在UBI中的所有闪存存储块都需要提前写入EC Header和VID Header（VID Header是在这个存储块映射到UBIFS的逻辑存储块时写入信息），所以UBI在使用之前先必须调用ubiformat进行格式化。也正因为EC Header等信息的存在，不能使用nandwrite这类工具直接写入UBI中包含的内存卡，而应该是时使用UBI操作的专门工具才行，否则会把EC Header信息擦去。


![image.png](/images/blog/对Linux的UBI以及UBIFS文件系统的学习总结-4.png)


对MTD分区使用ubiformat命令进行以上格式化以后，接下来就可以使用ubiattach命令把这个MTD分区绑定到UBI系统中，为应用层下一步挂载文件系统提供UBI卷的准备：


![image.png](/images/blog/对Linux的UBI以及UBIFS文件系统的学习总结-5.png)


经过以上的ubiattach绑定操作（实际上就是告诉Kenerl，这个MTD2分区是一个UBI镜像，按照UBI镜像）后，Kernel会在/dev下创建与这个UBI Image对应的设备文件/dev/ubi0:


![image.png](/images/blog/对Linux的UBI以及UBIFS文件系统的学习总结-6.png)


接下来，因为一个UBI image上可以创建多个UBI Volume，而每个UBI Volume上可以运行一个UBIFS的文件系统。所以可以进一步在UBI Image对应的/dev/ubi0设备文件上使用ubimkvol命令创建多个UBI Volume，并且把每个UBI Volume按照UBIFS文件系统挂载起来使用：


![image.png](/images/blog/对Linux的UBI以及UBIFS文件系统的学习总结-7.png)


关于UBIFS文件系统的内容在另外一篇笔记中整理。


如果需要把UBI Image从系统中解绑掉，则应该首先umount已经挂载到kernel上的UBIFS文件系统，然后调用ubidetach命令执行解绑动作：ubidetach -p /dev/mtd2。


## 参考资料

- [https://v.flomoapp.com/mine/?memo_id=NjY1ODgxMw](https://v.flomoapp.com/mine/?memo_id=NjY1ODgxMw)
- [文件系统(十)：一文看懂 UBI 文件系统 - liwen01 - 博客园](https://www.cnblogs.com/liwen01/p/18317752)
- 《固态存储：原理、架构与数据安全》

---


在[前一篇文章中](https://mp.weixin.qq.com/s/4pq-blEJdTzCf9Q_kCJveQ)整理了UBI部分相关的一些技术细节，下一部分主要总结在UBI基础上所运行的UBIFS文件系统的相关内容。


## UBIFS介绍


UBIFS：Unsorted Block Images File System。UBIFS是一种被设计用于运行在UBI之上的文件系统，因为UBIFS本身并不具备坏块处理、Flash Block的磨损平衡等方面的特性，所以UBIFS一定是要运行在创建于MTD分区之上的UBI层的。对于UBIFS而言，看到的Flash空间实际上就是已经通过UBI处理好坏块标记、磨损平衡等问题，并通过虚拟逻辑块与物理擦除块之间映射出来的理想Flash空间。


UBIFS的诞生，主要是为了解决之前一代的Flash文件系统，如JFFS2、YAFFS等在NAND Flash存储容量日益增大导致的文件系统加载速度慢、效率低等方面的问题。

- 例如JFFS2文件系统在启动过程在mount的时候，会读出这个JFFS2分区所在flash的所有内容，尝试构建出来完整的文件系统，这个过程与flash的大小线性相关，flash越大所需要的mount时间越长，因为JFFS2不适合于那些占用空间比较大的Flash分区。令外JFFS2文件系统也没有write back的机制，每次对JFFS2文件系统的写入都会直接写入Flash，这样就会导致Flash IO访问的效率比较低，而具备这个write back机制的UBIFS文件系统，在应用层写入UBIFS文件系统的操作会先写入内存，等到一定触发条件后才会一次性的写入flash，这样的IO访问效率会高很多，当然也会存在Flash突然掉电或者重启数据不完整的情况，这样就需要在进行关键数据写入时通过sync、fsync等操作强制把buffer的数据写入Flash。

UBIFS文件系统的优势：

- UBIFS借助于UBI层处于与MTD器件之间的操作，UBIFS文件系统的整个目录结构保存在flash中，这样在mount的时候就不需要把所有数据全部读出来重新建立文件系统的目录结构，因此mount操作的时间比较短而且不会随着文件系统的大小发生变化。
    - 但是需要注意，在UBIFS文件系统mount执行要先在MTD block上执行ubiattach的动作来对ubi image进行初始化，这个过程中会把每个bloack前两个page中的EC Header以及VID Header读出来，因此ubiattach所需要的时间是与这个ubi image所占的flash空间大小线性相关的。
- UBIFS由write back方面的支持，可有效提升Flash IO操作的效率。
- UBIFS支持日志Journal结构，可有效减少数据损失的风险并提高写入效率。
- UBIFS可以支持对文件系统内容进行压缩处理，节省文件系统所需要的存储空间。

## UBIFS的使用


对于UBIFS文件系统的使用而言，主要有两种方式：

- 使用mkfs.ubifs基于当前已有的目录结构及其内容制作UBIFS文件系统镜像；使用ubinize命令把这个UBIFS文件系统镜像打包到一个UBI镜像中；然后使用ubiformat命令（不能用nandwrite命令写ubi image到flash中）把这个UBI镜像烧写到指定的MTD分区中。此后就可以把这个UBI镜像上运行的UBIFS文件系统mount到Kernel开始读写操作了。
- 使用ubiformat命令把指定的MTD分区格式化为一个UBI image对应的分区；使用ubiattach命令把这个UBI image挂载到kernel中；在这个已挂载UBI镜像分区上使用mkubivol命令创建一个UBI volume；然后使用mount命令把这个新创建的UBI Volume挂载到系统的某个挂载点上。此后就可以在应用层像使用普通文件系统一样在这个文件系统中进行读写操作了。

一般而言，对于量产产品的开发而言，基本上都是提前把文件系统在Host主机上做好打包成烧写镜像写入flash，因此UBIFS文件系统的使用流程主要会采用第一种方式。


### 1. mkfs.ubifs制作UBIFS文件系统的镜像


使用mkfs.ubifs制作UBIFS文件系统镜像的前提，是要先准备好一个目录其中包含有文件系统的具体内容，以及一些flash和UBI操作的参数。


mkfs.ubifs命令的使用参数如下：


```bash
mkfs.ubifs -r <root-fs> -m <min i/o size> -e <logical erase block size> -c <max erase blocks> -o <output file>
example：
bash> mkfs.ubifs -r /opt/timesys/at91sam9260_ek/rfs/ -m 2048 -e 129024 -c 2048 -o ubifs.img
```

- -r <root-fs>：使用-r参数传递要打包UBIFS文件系统镜像的本地目录。
- -m <min i/o size>：读写flash的最小IO大小，实际上就是flash一个读写page的大小。具体要查所使用的flash的数据手册。
- -e <logical erase block size>：UBI层所释放出来的逻辑虚拟块的大小。需要注意逻辑块和物理块的大小是不一样的，因为每个物理块在UBI层中前两个page都会写入header信息，所以逻辑块的大小就是物理块的大小减去两个page size。
- -c <max erase blocks>：即这个UBIFS文件系统需要占用的最大空间所对应的erase block的数量，可以使用这个UBIFS文件系统的大小除以Flash物理块的大小得到。
- -o <output file>：输出的UBIFS文件系统镜像文件名称

### 2. ubinize创建UBI镜像


下一步要使用ubinize工具，基于第一步生成的UBIFS文件系统的镜像文件，配合其配置文件，进一步生成UBI镜像文件。**最终要烧写到flash中的镜像文件不是UBIFS的镜像文件，而应该是UBI镜像文件。**


需要在UBI镜像生成的配置文件中指定这个UBI镜像中所包含的UBIFS文件系统镜大小、名称、ID、UBIFS镜像文件等信息：

- mode：固定为ubi
- image：指定UBIFS文件系统镜像文件的名称
- vol_id：这个文件系统在UBI镜像上的卷ID
- vol_name：这个文件系统在UBI镜像上的卷名称
- vol_size：这个文件系统的大小。整个配置文件中可以有一个卷设置为autoresize。
- vol_type：静态只读还是动态可修改。

UBI镜像的配置文件实际上是一个ini文件，下面是一个例子：


```bash
[configuration-data-volume]
mode=ubi
image=config_data.img
vol_id=0
vol_size=512KiB
vol_type=static
vol_name=configuration

[rootfs-volume]
mode=ubi
image=rootfs.img
vol_id=1
vol_size=220MiB
vol_type=dynamic
vol_name=rootfs
vol_flags=autoresize
```


以上配置文件中包含了两个UBIFS镜像对应的UBI卷的配置信息，分别是configuration-data-volume和rootfs-volume，每个卷的下方指定了这个文件系统的大小、镜像文件名称、卷ID、卷名称等信息。后续ubinize命令的执行就是依赖于对这个文件进行解析进行的。


以上配置文件准备好以后，接下来就是调用ubinize命令来生成UBI镜像文件：


```bash
ubinize -p <physical erase block size> -m <min i/o size> -s <sub-page size> -o <output file> <ubi config>
example:
ubinize -p "128 KiB" -m 2048 -s 512 -o ubi.img ubi.ini
```

- -p <physical erase block size>：flash物理块的大小，从flash的数据手册上可以查到。
- -m <min i/o size>：跟mkfs.ubifs命令的-m参数一样，实际上是flash的page size。可以从flash的数据手册上查到。
- -s <sub-page size>：如果flash支持sub page的话，sub-page size就是sub page的大小，否则就是page size。
- -o <output file>：指定生成的UBI镜像文件的名称。
- <ubi config>：ubinize命令执行所需要的ini配置文件。

### 3. ubiformat烧写UBI image到MTD分区中


下一步就是使用ubiformat命令把以上生成的UBI image烧写到MTD分区之中。


```bash
ubiformat /dev/mtdX -f <ubi image file> [-s <subpage_size>] [-O vid_header_offset]
example:
ubiformat /dev/mtd5 -s 2048 -O 2048 -f rootfs.ubi
```

- -f <ubi image file>：使用-f指定要写入flash的ubi image文件。
- -s <subpage_size>：如果flash支持sub page的话，就是sub page size，否则就是page size。
- -O vid_header_offset：VID Header在每一个block的offset，一般是一个page size。

### 4. UBIFS的使用


经过以上三步操作以后，自定义的UBIFS就已经成功烧写到flash中了，下一步就是对UBIFS的使用：先调用ubiattach把UBI镜像分区注册到kernel中，然后再mount UBIFS文件系统到系统中。


ubiattach：


```bash
ubiattach /dev/ubi_ctrl -m <mtd partition> [-s <subpage_size>] [-O vid_header_offset]
example：
# ubiattach /dev/ubi_ctrl -m 1 -O 2048
```

- -m <mtd partition>：指定UBI分区在MTD上的索引
- -s <subpage_size>：子页大小。
- -O vid_header_offset：VID Header在每个block中的偏移位置。

mount UBIFS文件系统：


```bash
mount -t ubifs <volume descriptor> <mount point>
```


mount的这一步比较简单，UBIFS在mount时指定的volume descriptor可以支持两者方式，卷索引和卷名称：

- ubi<device number>_<volume number> (e.g. ubi0_4)
- ubi<device number>:<volume name> (e.g. ubi0:rootfs)

## UBIFS文件系统的存储结构


如上所述，UBIFS是工作在UBI镜像的分区卷上的，因此对于UBIFS而言，它所看到的存储空间是由UBI所维护的一个理想的存储空间，这个存储空间以一系列的逻辑擦除块LEB构成，由UBI层来处理逻辑擦除块与Flash上的物理擦除块PEB之间的对应关系。因此UBIFS的数据存储结构，总是从逻辑擦除块空间的第一个块LEB0开始。


### UBIFS中的节点概念


UBIFS文件系统中使用节点（Node）这个概念来描述这个文件系统的内容在Flash上存储所对应的不同类型的数据结构。**节点是构成UBI文件系统的基本操作元素，可以说保存在UBIFS文件系统中的内容就是一个个不同类型的节点。**


总体来说，UBIFS中的节点主要分为以下几种类型：

- 索引节点（Index Node）：对应于文件系统中所保存的文件和目录的元数据和属性信息，例如文件大小、权限、时间戳、所有者信息以及指向文件/目录内容数据块的指针。在UBIFS中，索引节点类似于Linux Kernel中的inode的概念。
- 数据节点（Data Node）：数据节点中保存了文件系统中文件内容所对应的实际数据部分，每个文件的数据节点所在的位置通过其索引节点所包含的指针来访问和引用。
- 目录项节点（Directory Entry Node）：用于保存目录中所包含文件/目录名以及对应的索引节点的编号，因此目录项节点用于在文件系统中组织和管理目录中的文件和子目录。
- Master节点（Master Node）：保存在UBIFS文件系统地Master分区中，其中主要包含了文件系统的全局性信息，如最高的index node编号、提交编号、根索引节点的位置等。
- 垃圾收集节点（Gabage Collection Node）：当UBIFS文件系统中的某个文件数据被修改，新的数据会被写入其他的LEB，之前的LEB中的数据因为过期应被擦除，但是UBIFS的实际操作中，这些过期的LEB并不会被立即擦除，而是标记为过期LEB，并且记录在垃圾收集节点中，后续在存储空间比较紧张的情况下，由垃圾回收机制基于垃圾收集节点中保存的内容进行统一地擦除、回收和重用。
- 孤儿节点（Orphan Node）：当UBIFS文件系统中的一个文件被删除以后，它的索引节点编号（Index Node Number）会被保存在孤儿节点中。所有的Orphan节点保存在UBIFS文件系统结构中的Orphan分区中，如果发生了非正常卸载（例如擦除操作到一半的情况下卸载文件系统）的情况，下次mount这个文件系统的时候，就会去扫描孤儿分区中的孤儿节点，把其中保存的待删除文件的inode删除掉，保证文件系统操作的统一性。
- 日志节点（Journal Node）：UBIFS作为一种日志型的文件系统，所有对其中文件内容的修改操作首先会写入日志节点，最后再作为原子操作提交到对主文件系统内容的修改。所以日志节点及其UBIFS存储结构中的日志分区就是用来保存这些修改操作的记录。

### UBIFS存储结构


整体的存储结构上，UBIFS把其所在UBI分区卷分为6个区域：

- Super Block分区，固定占用LEB0，对应于Linux Kernel中的struct ubifs_sb_node结构体，其中保存了这个UBIFS文件系统固定不变的参数，例如Flash擦除块的大小、读写页的大小、整个文件系统占用的LEB的总数量、文件系统的属性等信息。
- Master分区，固定占用LEB1和LEB2，用于保存每个索引节点的根节点，两个LEB的内容完全一样。相互备份确保在异常掉电的时候能够快速的恢复出来。Master分区对应于kernel中的struct ubifs_mst_node结构体。Master分区中所包含的重点信息有：
    - 提交号，commit number，每次向flash器件的修改提交都会更新这个commit number，由此来保证文件系统修改的一致性。
    - 根索引节点的位置，即这个UBIFS文件系统根目录对应的索引节点在UBI镜像上所在的位置，包括其所在的LEB编号（root_lnum）和偏移量（root_offs），文件系统加载的时候可以通过这个信息找到根目录对应的索引节点，接入找到它下面包含的子目录和文件。
    - Total Free、Total Dirty、Total Used、Total Dead、Total Dark，记录了文件系统中各种状态空间的总量，包括空闲空间、脏空间、已使用空间、已死亡空间和暗空间
- Journal分区从LEB3开始。Journal分区用于保存日志节点的内容，也就是保存所有对文件和目录内容的修改操作，以方便在异常情况下进行原子回滚操作。Journal分区的大小可以在mkfs.ubifs命令中指定，而其占据的LEB的数量在Super Block中的log_lebs参数定义。
- LEB Properties分区，也就是LEB属性区，用于保存这个UBIFS文件系统所包含的所有的LEB的占用情况
- Orphan分区用于保存所有的Orphan节点，其作用如上所述，用于在Orphan节点中缓存所有待删除文件的inode number，方便在发生删除操作进行的过程中出现异常情况后，操作系统下次mount文件系统的时候删除这些文件以保证文件系统结构的一致性。
- Main分区就用于保存文件系统中所有的实际内容，例如这个文件系统所包含的所有目录和文件的索引节点、目录项节点以及数据节点。

## 参考资料：

- [How to Use UBIFS | Timesys LinuxLink](https://linuxlink.timesys.com/docs/wiki/engineering/HOWTO_Use_UBIFS)
- [文件系统(十)：一文看懂 UBI 文件系统 - liwen01 - 博客园](https://www.cnblogs.com/liwen01/p/18317752)
